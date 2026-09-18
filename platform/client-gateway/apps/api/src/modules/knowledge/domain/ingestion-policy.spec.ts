import { decideIngestion } from './ingestion-policy';

describe('decideIngestion', () => {
  it('fuente verificada y no restringida -> indexable', () => {
    const decision = decideIngestion({ classification: 'internal', verificationStatus: 'verified' });
    expect(decision.indexable).toBe(true);
  });

  it('classification "restricted" NUNCA se indexa, aunque este verificada', () => {
    const decision = decideIngestion({ classification: 'restricted', verificationStatus: 'verified' });
    expect(decision.indexable).toBe(false);
    expect(decision.reason).toContain('restricted');
  });

  it('fuente sin verificar no se indexa', () => {
    const decision = decideIngestion({ classification: 'public', verificationStatus: 'unverified' });
    expect(decision.indexable).toBe(false);
  });

  it('fuente marcada "flagged" no se indexa aunque haya estado verificada antes', () => {
    const decision = decideIngestion({ classification: 'public', verificationStatus: 'flagged' });
    expect(decision.indexable).toBe(false);
  });

  it('fuente revocada no se indexa', () => {
    const decision = decideIngestion({ classification: 'public', verificationStatus: 'revoked' });
    expect(decision.indexable).toBe(false);
  });
});
