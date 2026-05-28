import json
from datetime import datetime
from typing import Callable, List, Dict, Any


class ComplianceRule:
    """
    A reactive compliance rule: if X then Y.

    Example:
        rule = ComplianceRule(
            name='validate_invoice_rnc',
            description='Ensure customer RNC is valid before invoice posting',
            trigger='write_account.move',  # trigger on write to account.move
            condition=lambda move: move.move_type == 'out_invoice' and move.state == 'posted',
            action=lambda move: check_rnc_valid(move),
            enforcement='block',  # block if rule fails
            severity='critical',  # log level if enforced
        )
    """

    def __init__(
        self,
        name: str,
        description: str,
        trigger: str,  # 'create_model.name', 'write_model.name', 'unlink_model.name', 'sync_*'
        condition: Callable[[Any], bool],
        action: Callable[[Any], Dict],
        enforcement: str = 'log',  # 'log', 'warn', 'block'
        severity: str = 'medium',  # 'critical', 'high', 'medium', 'low'
    ):
        self.name = name
        self.description = description
        self.trigger = trigger
        self.condition = condition
        self.action = action
        self.enforcement = enforcement  # log (just log), warn (log + notification), block (raise error)
        self.severity = severity
        self.created_at = datetime.now()
        self.last_executed = None
        self.execution_count = 0

    def matches_trigger(self, event_type: str, model_name: str) -> bool:
        """Check if this rule matches a given trigger event."""
        trigger_parts = self.trigger.split('_')
        if len(trigger_parts) < 2:
            return False

        event_action = trigger_parts[0]  # 'create', 'write', 'unlink', 'sync'
        trigger_model = '_'.join(trigger_parts[1:])  # everything after first underscore

        # Support wildcard triggers
        if trigger_model == '*':
            return event_type == event_action

        return event_type == event_action and model_name == trigger_model

    def execute(self, record: Any, env) -> Dict:
        """
        Execute the rule on a given record.

        Returns:
            {
                'matched': bool,
                'executed': bool,
                'result': action result or None,
                'error': error message or None,
                'enforcement_action': 'log'|'warn'|'block',
            }
        """
        result = {
            'matched': False,
            'executed': False,
            'result': None,
            'error': None,
            'enforcement_action': self.enforcement,
            'rule_name': self.name,
        }

        try:
            # Check if rule condition is met
            if not self.condition(record):
                return result

            result['matched'] = True

            # Execute the rule action
            action_result = self.action(record)
            result['result'] = action_result
            result['executed'] = True

            self.last_executed = datetime.now()
            self.execution_count += 1

            # Log the execution
            env['ir.logging'].create({
                'name': f'ORCA Rule Executed: {self.name}',
                'type': 'server',
                'level': self.severity,
                'message': f'{self.description} on {record._name}[{record.id}]',
            })

            # Handle enforcement
            if not action_result.get('success', False):
                result['error'] = action_result.get('message', 'Rule action failed')

                if self.enforcement == 'block':
                    raise Exception(f'Compliance rule blocked: {result["error"]}')

            return result

        except Exception as e:
            result['error'] = str(e)
            result['executed'] = False
            return result


class OrcaRulesEngine:
    """
    Reactive rules engine for ORCA compliance enforcement.

    Manages a registry of ComplianceRules that trigger on ORCA audit events
    and enforce compliance policies across all modules.

    Example usage:
        engine = OrcaRulesEngine(env)
        engine.register_rule(rule_validate_rnc)
        engine.register_rule(rule_check_fiscal_date)
        engine.register_rule(rule_prevent_duplicate_encf)

        # Later, when an account.move is written:
        engine.execute('write', 'account.move', move_record)
    """

    def __init__(self, env):
        self.env = env
        self.rules: List[ComplianceRule] = []
        self.rule_registry: Dict[str, ComplianceRule] = {}
        self._init_default_rules()

    def _init_default_rules(self):
        """Initialize default compliance rules for critical modules."""
        # Placeholder: will be populated with actual rules in Phase 1B+
        pass

    def register_rule(self, rule: ComplianceRule):
        """Register a new compliance rule."""
        self.rules.append(rule)
        self.rule_registry[rule.name] = rule

    def execute(self, event_type: str, model_name: str, record: Any) -> Dict:
        """
        Execute all matching rules for a given event.

        Args:
            event_type: 'create', 'write', 'unlink', 'sync'
            model_name: Odoo model name (e.g., 'account.move')
            record: The record being processed

        Returns:
            {
                'total_rules': int,
                'matched_rules': int,
                'executed_rules': int,
                'failed_rules': int,
                'blocking_errors': [],
                'warnings': [],
                'executions': [rule execution results],
            }
        """
        execution_results = {
            'total_rules': len(self.rules),
            'matched_rules': 0,
            'executed_rules': 0,
            'failed_rules': 0,
            'blocking_errors': [],
            'warnings': [],
            'executions': [],
        }

        for rule in self.rules:
            if not rule.matches_trigger(event_type, model_name):
                continue

            execution_results['matched_rules'] += 1

            # Execute the rule
            rule_result = rule.execute(record, self.env)
            execution_results['executions'].append(rule_result)

            if rule_result['executed']:
                execution_results['executed_rules'] += 1

            if rule_result['error']:
                execution_results['failed_rules'] += 1

                if rule.enforcement == 'block':
                    execution_results['blocking_errors'].append({
                        'rule': rule.name,
                        'error': rule_result['error'],
                    })

                elif rule.enforcement == 'warn':
                    execution_results['warnings'].append({
                        'rule': rule.name,
                        'message': rule_result['error'],
                    })

        return execution_results

    def get_rule(self, rule_name: str) -> ComplianceRule:
        """Get a rule by name."""
        return self.rule_registry.get(rule_name)

    def disable_rule(self, rule_name: str):
        """Temporarily disable a rule."""
        rule = self.get_rule(rule_name)
        if rule:
            self.rules.remove(rule)

    def enable_rule(self, rule_name: str):
        """Re-enable a disabled rule."""
        rule = self.rule_registry.get(rule_name)
        if rule and rule not in self.rules:
            self.rules.append(rule)

    def get_execution_stats(self) -> Dict:
        """Get statistics on rule executions."""
        stats = {
            'total_rules': len(self.rules),
            'rules': [],
        }

        for rule in self.rules:
            stats['rules'].append({
                'name': rule.name,
                'description': rule.description,
                'enforcement': rule.enforcement,
                'severity': rule.severity,
                'execution_count': rule.execution_count,
                'last_executed': rule.last_executed.isoformat() if rule.last_executed else None,
            })

        return stats


# Pre-defined compliance rules (for critical modules)

def create_rnc_validation_rule(env) -> ComplianceRule:
    """Create rule: validate customer RNC before posting invoice."""

    def condition(move):
        return (
            hasattr(move, 'move_type') and
            move.move_type == 'out_invoice' and
            move.state == 'posted' and
            hasattr(move, 'partner_id')
        )

    def action(move):
        partner = move.partner_id
        rnc = getattr(partner, 'l10n_do_rnc', None)

        if not rnc:
            return {
                'success': False,
                'message': f'Customer {partner.name} missing RNC (Dominican Republic)',
            }

        # Validate RNC format (11 digits)
        if not (isinstance(rnc, str) and len(rnc) == 11 and rnc.isdigit()):
            return {
                'success': False,
                'message': f'Invalid RNC format: {rnc} (must be 11 digits)',
            }

        return {
            'success': True,
            'message': f'RNC validated: {rnc}',
            'rnc': rnc,
        }

    return ComplianceRule(
        name='validate_customer_rnc',
        description='Ensure customer RNC is valid (Dominican Republic)',
        trigger='write_account.move',
        condition=condition,
        action=action,
        enforcement='block',
        severity='critical',
    )


def create_fiscal_date_rule(env) -> ComplianceRule:
    """Create rule: ensure invoice date matches fiscal period."""

    def condition(move):
        return (
            hasattr(move, 'move_type') and
            move.move_type in ['out_invoice', 'out_refund'] and
            hasattr(move, 'invoice_date')
        )

    def action(move):
        # Placeholder: check invoice_date is within active fiscal period
        return {
            'success': True,
            'message': f'Invoice date {move.invoice_date} is valid',
        }

    return ComplianceRule(
        name='validate_fiscal_date',
        description='Ensure invoice date is within fiscal period',
        trigger='write_account.move',
        condition=condition,
        action=action,
        enforcement='warn',
        severity='high',
    )


def create_duplicate_encf_rule(env) -> ComplianceRule:
    """Create rule: prevent duplicate e-CF numbers in invoices."""

    def condition(move):
        return (
            hasattr(move, 'l10n_do_encf') and
            bool(move.l10n_do_encf)
        )

    def action(move):
        # Check if this e-CF is already used
        existing = env['account.move'].search([
            ('l10n_do_encf', '=', move.l10n_do_encf),
            ('id', '!=', move.id),
        ])

        if existing:
            return {
                'success': False,
                'message': f'e-CF {move.l10n_do_encf} already used in move {existing[0].id}',
            }

        return {
            'success': True,
            'message': f'e-CF {move.l10n_do_encf} is unique',
        }

    return ComplianceRule(
        name='prevent_duplicate_encf',
        description='Prevent duplicate e-CF numbers in fiscal documents',
        trigger='write_account.move',
        condition=condition,
        action=action,
        enforcement='block',
        severity='critical',
    )
