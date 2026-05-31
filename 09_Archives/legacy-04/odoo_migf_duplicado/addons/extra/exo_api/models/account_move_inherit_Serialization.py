# -*- coding: utf-8 -*-
import logging
import time, random
import psycopg2
from odoo import models, api

_logger = logging.getLogger(__name__)

# ======================================================
# [CHANGE] Decorador para reintentos de concurrencia
# ======================================================
def retry_serialization(max_attempts=6, base_sleep=0.1):
    def deco(fn):
        def wrapper(*args, **kwargs):
            env = args[0].env
            for attempt in range(max_attempts):
                try:
                    with env.cr.savepoint():
                        return fn(*args, **kwargs)
                except psycopg2.errors.SerializationFailure:
                    env.cr.rollback()
                    sleep_time = base_sleep * (2 ** attempt) + random.random() * base_sleep
                    _logger.warning(
                        f"[RETRY] SerializationFailure en {fn.__name__}, intento {attempt+1}/{max_attempts}, esperando {sleep_time:.2f}s"
                    )
                    time.sleep(sleep_time)
            raise
        return wrapper
    return deco


class AccountMoveInherit(models.Model):
    _inherit = "account.move"

    # ======================================================
    # [CHANGE] Advisory lock para proteger unlink
    # ======================================================
    def _advisory_lock(self, key):
        self.env.cr.execute("SELECT pg_advisory_xact_lock(hashtextextended(%s, 0))", [key])

    # ======================================================
    # Sobrescritura de unlink con retry y locks
    # ======================================================
    @retry_serialization()  # [CHANGE] reintentos por SerializationFailure
    def unlink(self):
        for move in self:
            # [CHANGE] Bloqueo por registro para evitar doble eliminación concurrente
            lock_key = f"unlink:{move._name}:{move.id}"
            self._advisory_lock(lock_key)

            _logger.info(f"[UNLINK] Eliminando move {move.id} con lock {lock_key}")

        return super(AccountMoveInherit, self).unlink()
