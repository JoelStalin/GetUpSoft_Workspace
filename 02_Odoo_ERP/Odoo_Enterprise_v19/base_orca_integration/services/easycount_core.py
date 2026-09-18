import json
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum


class FiscalOperationType(Enum):
    """Types of fiscal operations supported across all ERPs."""
    INVOICE = 'invoice'
    CREDIT_NOTE = 'credit_note'
    DEBIT_NOTE = 'debit_note'
    RECEIPT = 'receipt'
    REPORT = 'report'
    REFUND = 'refund'
    RETURN = 'return'


class JurisdictionType(Enum):
    """Tax jurisdictions supported by EasyCount."""
    DOMINICAN_REPUBLIC = 'do_dgii'
    SPAIN = 'es_aeat'
    MEXICO = 'mx_sat'
    ARGENTINA = 'ar_afip'
    CHILE = 'cl_sii'
    COLOMBIA = 'co_dian'
    BRAZIL = 'br_nfe'


class FiscalOperation:
    """
    Base class representing a fiscal operation abstraction.

    Independent of any specific ERP (Odoo, SAP, NetSuite, etc.).
    Contains all data needed for fiscal submission and validation.

    Example:
        op = FiscalOperation(
            erp_type='odoo',
            document_type='invoice',
            document_id=12345,
            company_id='company1',
            fiscal_data={
                'amount': 1000.00,
                'tax': 200.00,
                'customer': {'name': 'ACME Corp', 'rnc': '123456789'},
                'date': '2026-05-27',
                'items': [...]
            }
        )
    """

    def __init__(
        self,
        erp_type: str,
        document_type: str,
        document_id: int,
        company_id: str,
        fiscal_data: dict,
        jurisdiction: str = 'do_dgii'
    ):
        self.erp_type = erp_type  # 'odoo', 'sap', 'netsuite', etc.
        self.document_type = document_type  # FiscalOperationType
        self.document_id = document_id
        self.company_id = company_id
        self.fiscal_data = fiscal_data  # {amount, tax, customer, date, etc.}
        self.jurisdiction = jurisdiction  # JurisdictionType
        self.created_at = datetime.now().isoformat()
        self.validation_errors = []
        self.status = 'pending'  # pending, validated, submitted, error

    def to_dict(self):
        """Convert to JSON-serializable dict."""
        return {
            'erp_type': self.erp_type,
            'document_type': self.document_type,
            'document_id': self.document_id,
            'company_id': self.company_id,
            'fiscal_data': self.fiscal_data,
            'jurisdiction': self.jurisdiction,
            'created_at': self.created_at,
            'status': self.status,
            'validation_errors': self.validation_errors,
        }

    def to_json(self):
        """Convert to JSON string."""
        return json.dumps(self.to_dict(), default=str)


class ERPFiscalAdapter(ABC):
    """
    Abstract adapter for extracting fiscal operations from any ERP.

    Each ERP (Odoo, SAP, NetSuite, etc.) implements this to normalize
    fiscal documents into FiscalOperation abstraction.
    """

    @abstractmethod
    def extract_fiscal_operation(self, document) -> FiscalOperation:
        """Extract FiscalOperation from ERP-specific document."""
        pass

    @abstractmethod
    def sync_back(self, operation: FiscalOperation) -> bool:
        """Sync FiscalOperation result back to ERP (mark as submitted, etc.)."""
        pass


class OdooFiscalAdapter(ERPFiscalAdapter):
    """Adapter for extracting fiscal operations from Odoo (all versions v12-v19)."""

    def __init__(self, env):
        self.env = env

    def extract_fiscal_operation(self, move_id: int) -> FiscalOperation:
        """
        Extract FiscalOperation from Odoo account.move record.

        Args:
            move_id: int, ID of account.move record

        Returns:
            FiscalOperation with Odoo move data normalized
        """
        move = self.env['account.move'].browse(move_id)

        if not move.exists():
            raise ValueError(f'account.move {move_id} not found')

        # Determine document type
        if move.move_type == 'out_invoice':
            doc_type = FiscalOperationType.INVOICE.value
        elif move.move_type == 'out_refund':
            doc_type = FiscalOperationType.CREDIT_NOTE.value
        else:
            doc_type = FiscalOperationType.INVOICE.value

        # Extract jurisdiction (default: Dominican Republic)
        jurisdiction = 'do_dgii'
        if hasattr(move.company_id, 'country_id') and move.company_id.country_id:
            country_code = move.company_id.country_id.code
            jurisdiction_map = {
                'DO': 'do_dgii',
                'ES': 'es_aeat',
                'MX': 'mx_sat',
                'AR': 'ar_afip',
                'CL': 'cl_sii',
                'CO': 'co_dian',
                'BR': 'br_nfe',
            }
            jurisdiction = jurisdiction_map.get(country_code, 'do_dgii')

        # Extract customer data
        customer = {}
        if move.partner_id:
            customer = {
                'id': move.partner_id.id,
                'name': move.partner_id.name,
                'rnc': getattr(move.partner_id, 'l10n_do_rnc', ''),
                'email': move.partner_id.email or '',
            }

        # Extract fiscal data
        fiscal_data = {
            'amount_untaxed': move.amount_untaxed,
            'amount_tax': move.amount_tax,
            'amount_total': move.amount_total,
            'currency': move.currency_id.name if move.currency_id else 'DOP',
            'date': move.invoice_date.isoformat() if move.invoice_date else datetime.now().isoformat(),
            'customer': customer,
            'reference': move.ref or '',
            'journal': move.journal_id.name if move.journal_id else '',
            'state': move.state,
            'lines': [
                {
                    'name': line.name,
                    'qty': line.quantity,
                    'unit_price': line.price_unit,
                    'amount': line.price_subtotal,
                }
                for line in move.line_ids
            ],
        }

        # Add Odoo-specific fields if present
        if hasattr(move, 'l10n_do_fiscal_number'):
            fiscal_data['fiscal_number'] = move.l10n_do_fiscal_number

        if hasattr(move, 'l10n_do_encf'):
            fiscal_data['encf'] = move.l10n_do_encf

        if hasattr(move, 'l10n_latam_document_type_id'):
            fiscal_data['document_type_id'] = move.l10n_latam_document_type_id.id

        return FiscalOperation(
            erp_type='odoo',
            document_type=doc_type,
            document_id=move.id,
            company_id=f'odoo_{move.company_id.id}',
            fiscal_data=fiscal_data,
            jurisdiction=jurisdiction,
        )

    def sync_back(self, operation: FiscalOperation) -> bool:
        """
        Sync FiscalOperation result back to Odoo account.move.

        Args:
            operation: FiscalOperation with results from DGII/AEAT/etc

        Returns:
            bool: True if update succeeded
        """
        move = self.env['account.move'].browse(operation.document_id)

        if not move.exists():
            return False

        try:
            update_vals = {'orca_synced': True}

            # Map result back to move (vary by jurisdiction)
            if operation.jurisdiction == 'do_dgii':
                if hasattr(move, 'dgii_uuid') and operation.fiscal_data.get('dgii_uuid'):
                    update_vals['dgii_uuid'] = operation.fiscal_data['dgii_uuid']

                if hasattr(move, 'l10n_do_encf') and operation.fiscal_data.get('encf'):
                    update_vals['l10n_do_encf'] = operation.fiscal_data['encf']

            move.write(update_vals)
            return True

        except Exception as e:
            self.env['ir.logging'].create({
                'name': 'ORCA Sync Back Error',
                'type': 'server',
                'level': 'error',
                'message': f'Failed to sync back operation {operation.document_id}: {str(e)}',
            })
            return False


class SAPFiscalAdapter(ERPFiscalAdapter):
    """Adapter for SAP fiscal operations (placeholder for Phase 2)."""

    def extract_fiscal_operation(self, document) -> FiscalOperation:
        """Extract FiscalOperation from SAP document."""
        # Placeholder for Phase 2 (Q3 2026)
        raise NotImplementedError('SAP adapter implemented in Phase 2')

    def sync_back(self, operation: FiscalOperation) -> bool:
        """Sync back to SAP."""
        raise NotImplementedError('SAP adapter implemented in Phase 2')


class NetSuiteFiscalAdapter(ERPFiscalAdapter):
    """Adapter for NetSuite fiscal operations (placeholder for Phase 3)."""

    def extract_fiscal_operation(self, document) -> FiscalOperation:
        """Extract FiscalOperation from NetSuite document."""
        # Placeholder for Phase 3 (Q4 2026)
        raise NotImplementedError('NetSuite adapter implemented in Phase 3')

    def sync_back(self, operation: FiscalOperation) -> bool:
        """Sync back to NetSuite."""
        raise NotImplementedError('NetSuite adapter implemented in Phase 3')


class FiscalOperationProcessor:
    """
    Main processor for fiscal operations.

    Takes a FiscalOperation (ERP-agnostic), routes to correct validator
    based on jurisdiction, and orchestrates submission to tax authorities.

    Example:
        processor = FiscalOperationProcessor(env, odoo_adapter)
        operation = odoo_adapter.extract_fiscal_operation(move_id)
        result = processor.process(operation)
    """

    def __init__(self, env):
        self.env = env
        self.adapters = {
            'odoo': OdooFiscalAdapter(env),
            'sap': SAPFiscalAdapter(),
            'netsuite': NetSuiteFiscalAdapter(),
        }

    def process(self, operation: FiscalOperation) -> dict:
        """
        Process fiscal operation: validate, submit to tax authority, sync back.

        Args:
            operation: FiscalOperation instance

        Returns:
            dict with status, validation_errors, submission_results
        """
        result = {
            'status': 'success',
            'validation_errors': [],
            'submission_results': {},
            'synced_back': False,
        }

        try:
            # Step 1: Validate operation
            validation_errors = self._validate_operation(operation)
            if validation_errors:
                operation.validation_errors = validation_errors
                operation.status = 'error'
                result['status'] = 'validation_failed'
                result['validation_errors'] = validation_errors
                return result

            operation.status = 'validated'

            # Step 2: Submit to tax authority (varies by jurisdiction)
            submission_result = self._submit_to_authority(operation)
            result['submission_results'] = submission_result

            if submission_result.get('success'):
                operation.status = 'submitted'
                operation.fiscal_data.update(submission_result)

            # Step 3: Sync result back to ERP
            adapter = self.adapters.get(operation.erp_type)
            if adapter:
                synced = adapter.sync_back(operation)
                result['synced_back'] = synced

            return result

        except Exception as e:
            operation.status = 'error'
            operation.validation_errors.append(str(e))
            result['status'] = 'error'
            result['validation_errors'] = [str(e)]
            return result

    def _validate_operation(self, operation: FiscalOperation) -> list:
        """Validate fiscal operation against jurisdiction rules."""
        errors = []

        # Basic validations
        if not operation.company_id:
            errors.append('company_id is required')

        if operation.fiscal_data.get('amount_total', 0) < 0:
            errors.append('amount_total must be positive')

        customer = operation.fiscal_data.get('customer', {})
        if not customer.get('name'):
            errors.append('customer name is required')

        # Jurisdiction-specific validations
        if operation.jurisdiction == 'do_dgii':
            if not customer.get('rnc'):
                errors.append('Customer RNC is required for Dominican Republic')

        elif operation.jurisdiction == 'mx_sat':
            if not customer.get('rfc'):
                errors.append('Customer RFC is required for Mexico')

        elif operation.jurisdiction == 'es_aeat':
            if not customer.get('nif'):
                errors.append('Customer NIF is required for Spain')

        return errors

    def _submit_to_authority(self, operation: FiscalOperation) -> dict:
        """Submit fiscal operation to tax authority (DGII, AEAT, SAT, etc.)."""
        # Placeholder: real implementation varies by jurisdiction
        # For now, return success with generated IDs

        results = {
            'success': True,
            'submitted_at': datetime.now().isoformat(),
        }

        if operation.jurisdiction == 'do_dgii':
            # Placeholder DGII submission
            results['dgii_uuid'] = f'dgii_{operation.document_id}_{datetime.now().timestamp()}'
            results['dgii_confirmation'] = 'mock_confirmation'

        elif operation.jurisdiction == 'mx_sat':
            # Placeholder SAT submission
            results['sat_uuid'] = f'sat_{operation.document_id}_{datetime.now().timestamp()}'
            results['sat_xml'] = 'mock_xml_content'

        elif operation.jurisdiction == 'es_aeat':
            # Placeholder AEAT submission
            results['aeat_reference'] = f'aeat_{operation.document_id}'

        return results
