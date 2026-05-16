import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/auth-store';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input } from '@getupsoft/ui';
export const MFA = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const setSession = useAuthStore((state) => state.setSession);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const state = location.state;
    const challengeId = state?.challengeId;
    useEffect(() => {
        if (!challengeId) {
            navigate('/login', { replace: true });
        }
    }, [challengeId, navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/v1/auth/mfa/verify', {
                challenge_id: challengeId,
                code,
            });
            let role = 'USER';
            if (data.user.roles.includes('platform_admin'))
                role = 'ADMIN';
            else if (data.user.roles.includes('partner_admin'))
                role = 'PARTNER';
            else if (data.user.roles.includes('tenant_admin'))
                role = 'SOCIO';
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
        }
        catch (err) {
            setError('Código inválido o sesión expirada.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex items-center justify-center min-h-screen bg-black text-white p-4 font-sans", children: [_jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: _jsx("div", { className: "absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full" }) }), _jsxs(Card, { className: "w-full max-w-md relative border-zinc-800/50", children: [_jsxs(CardHeader, { className: "text-center space-y-4", children: [_jsxs("button", { onClick: () => navigate('/login'), className: "absolute top-6 left-6 flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-mono", children: [_jsx(ArrowLeft, { className: "w-3 h-3" }), _jsx("span", { children: "Regresar" })] }), _jsx("div", { className: "inline-flex p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto", children: _jsx(ShieldCheck, { className: "w-10 h-10" }) }), _jsxs("div", { className: "space-y-1", children: [_jsx(CardTitle, { children: "Verificaci\u00F3n" }), _jsx(CardDescription, { children: "MFA Security Handshake" })] })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("p", { className: "text-zinc-500 text-sm text-center px-4", children: "Introduce el c\u00F3digo de 6 d\u00EDgitos de tu aplicaci\u00F3n de autenticaci\u00F3n para autorizar la sesi\u00F3n." }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(Input, { type: "text", inputMode: "numeric", pattern: "[0-9]*", maxLength: 6, placeholder: "000000", value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, '')), className: "py-8 text-center text-3xl font-black tracking-[0.5em] text-cyan-400", required: true, autoFocus: true }), error && _jsx("p", { className: "text-center text-[10px] text-red-400 font-mono uppercase tracking-tighter", children: error })] }), _jsx(Button, { type: "submit", disabled: loading || code.length !== 6, variant: "glow", className: "w-full", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" }), _jsx("span", { children: "VERIFICANDO..." })] })) : (_jsx("span", { children: "CONFIRMAR ACCESO" })) })] }), _jsx("div", { className: "pt-6 mt-6 border-t border-zinc-800/50 text-center", children: _jsx("p", { className: "text-[10px] text-zinc-600 font-mono uppercase tracking-widest", children: "PROTOCOL: MFA-TOTP-SECURE" }) })] })] })] }));
};
