import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore, UserRole } from '../store/auth-store';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input } from '@getupsoft/ui';

interface LocationState {
  challengeId?: string;
  email?: string;
}

export const MFA: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = location.state as LocationState | undefined;
  const challengeId = state?.challengeId;

  useEffect(() => {
    if (!challengeId) {
      navigate('/login', { replace: true });
    }
  }, [challengeId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/v1/auth/mfa/verify', {
        challenge_id: challengeId,
        code,
      });

      let role: UserRole = 'USER';
      if (data.user.roles.includes('platform_admin')) role = 'ADMIN';
      else if (data.user.roles.includes('partner_admin')) role = 'PARTNER';
      else if (data.user.roles.includes('tenant_admin')) role = 'SOCIO';

      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: role,
          tenantId: data.user.tenantId,
        },
      });
      navigate('/');
    } catch (err) {
      setError('Código inválido o sesión expirada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full"></div>
      </div>

      <Card className="w-full max-w-md relative border-zinc-800/50">
        <CardHeader className="text-center space-y-4">
          <button 
            onClick={() => navigate('/login')}
            className="absolute top-6 left-6 flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-mono"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Regresar</span>
          </button>

          <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-1">
            <CardTitle>Verificación</CardTitle>
            <CardDescription>MFA Security Handshake</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-zinc-500 text-sm text-center px-4">Introduce el código de 6 dígitos de tu aplicación de autenticación para autorizar la sesión.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="py-8 text-center text-3xl font-black tracking-[0.5em] text-cyan-400"
                required
                autoFocus
              />
              {error && <p className="text-center text-[10px] text-red-400 font-mono uppercase tracking-tighter">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              variant="glow"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>VERIFICANDO...</span>
                </>
              ) : (
                <span>CONFIRMAR ACCESO</span>
              )}
            </Button>
          </form>

          <div className="pt-6 mt-6 border-t border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">PROTOCOL: MFA-TOTP-SECURE</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
