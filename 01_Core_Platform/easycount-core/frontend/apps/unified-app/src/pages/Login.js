import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useLoginMutation } from '../api/auth';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from '@getupsoft/ui';
import { useNavigate } from 'react-router-dom';
export const Login = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const navigate = useNavigate();
    const loginMutation = useLoginMutation();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginMutation.mutateAsync({ email, password });
            if (response.mfa_required) {
                navigate('/mfa', { state: { challengeId: response.challenge_id, email } });
                return;
            }
            navigate('/');
        }
        catch (error) {
            console.error('Login failed', error);
        }
    };
    return (_jsxs("div", { className: "flex items-center justify-center min-h-screen bg-black text-white p-4 font-sans selection:bg-cyan-500/30", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" }), _jsx("div", { className: "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/5 blur-[120px] rounded-full animate-pulse", style: { animationDelay: '1s' } })] }), _jsxs("div", { className: "w-full max-w-[440px] relative", children: [_jsxs(Card, { className: "border-zinc-800/50 overflow-hidden", children: [_jsx("div", { className: "h-1.5 w-full bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500" }), _jsxs(CardHeader, { className: "text-center pt-12 pb-8 space-y-3", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4 group hover:border-cyan-500/50 transition-all duration-500", children: _jsx(Lock, { className: "w-8 h-8 text-zinc-600 group-hover:text-cyan-400 transition-colors" }) }), _jsx(CardTitle, { className: "text-4xl font-black tracking-[0.1em] italic uppercase", children: "EasyCount" }), _jsx(CardDescription, { className: "text-[10px] tracking-[0.4em]", children: "Unified_Security_Portal_V2" })] }), _jsx(CardContent, { className: "px-10 pb-12", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Operator_Identity" }), _jsxs("div", { className: "relative group", children: [_jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-cyan-400 transition-colors z-10" }), _jsx(Input, { id: "email", type: "email", placeholder: "ENTER_EMAIL_ADDR", value: email, onChange: (e) => setEmail(e.target.value), className: "pl-12 bg-zinc-950/50 border-zinc-800 focus:border-cyan-500/30 transition-all font-mono text-sm", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Access_Cipher" }), _jsxs("div", { className: "relative group", children: [_jsx(Lock, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-pink-500 transition-colors z-10" }), _jsx(Input, { id: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), className: "pl-12 bg-zinc-950/50 border-zinc-800 focus:border-pink-500/30 transition-all", required: true })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Button, { type: "submit", disabled: loginMutation.isPending, variant: "glow", className: "w-full h-14 text-sm tracking-[0.2em] font-black group overflow-hidden", children: loginMutation.isPending ? (_jsx(Loader2, { className: "w-5 h-5 animate-spin" })) : (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "INITIALIZE_SESSION" }), _jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })] })) }), _jsxs("div", { className: "flex items-center justify-between px-1", children: [_jsx("button", { type: "button", className: "text-[9px] font-mono text-zinc-600 hover:text-cyan-400 transition-colors uppercase tracking-widest", children: "Forgot_Credentials?" }), _jsx("button", { type: "button", className: "text-[9px] font-mono text-zinc-600 hover:text-white transition-colors uppercase tracking-widest underline underline-offset-4", children: "Public_Registry" })] })] })] }) })] }), _jsxs("div", { className: "mt-8 flex items-center justify-center space-x-6 text-zinc-700 opacity-50", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-500" }), _jsx("span", { className: "text-[9px] font-mono uppercase tracking-[0.2em]", children: "Live_Node" })] }), _jsx("div", { className: "w-[1px] h-3 bg-zinc-800" }), _jsx("span", { className: "text-[9px] font-mono uppercase tracking-[0.2em]", children: "RSA_4096_ACTIVE" })] })] })] }));
};
