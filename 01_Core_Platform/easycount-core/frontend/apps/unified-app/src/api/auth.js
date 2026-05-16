import { useMutation } from '@tanstack/react-query';
import { api } from './client';
import { useAuthStore } from '../store/auth-store';
export const useLoginMutation = () => {
    const setSession = useAuthStore((state) => state.setSession);
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post('/api/v1/auth/login', {
                ...payload,
                portal: 'unified',
            });
            return data;
        },
        onSuccess: (data) => {
            if (data.mfa_required)
                return;
            let role = 'USER';
            if (data.user.roles.includes('platform_admin'))
                role = 'ADMIN';
            else if (data.user.roles.includes('partner_admin'))
                role = 'PARTNER';
            else if (data.user.roles.includes('tenant_admin'))
                role = 'SOCIO';
            setSession({
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    role: role,
                    tenantId: data.user.tenant_id,
                },
            });
        },
    });
};
