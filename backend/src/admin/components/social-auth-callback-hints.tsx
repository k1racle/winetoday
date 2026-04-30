import { Box, Field, Flex, Typography } from '@strapi/design-system';
import { useEffect, useMemo, useState } from 'react';

type CallbackUrls = {
  google?: string;
  vk?: string;
  yandex?: string;
};

type SocialAuthSettingsResponse = {
  data?: {
    callbackUrls?: CallbackUrls;
  } | null;
};

type ProviderHintProps = {
  label: string;
  value?: string;
};

function ProviderHint({ label, value }: ProviderHintProps) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Box
        background="neutral100"
        borderColor="neutral200"
        hasRadius
        padding={3}
        shadow="filterShadow"
      >
        <Typography textColor={value ? 'neutral800' : 'neutral500'} variant="omega">
          {value ?? 'URL будет доступен после определения публичного адреса backend'}
        </Typography>
      </Box>
      <Typography textColor="neutral600" variant="pi">
        Скопируйте этот callback URL в настройках OAuth-приложения провайдера.
      </Typography>
    </Field.Root>
  );
}

export default function SocialAuthCallbackHints() {
  const [callbackUrls, setCallbackUrls] = useState<CallbackUrls | null>(null);
  const [error, setError] = useState(false);

  const isSocialAuthSettings = useMemo(
    () => typeof window !== 'undefined' && window.location.pathname.includes(encodeURIComponent('api::social-auth-setting.social-auth-setting')),
    [],
  );

  useEffect(() => {
    if (!isSocialAuthSettings) {
      return undefined;
    }

    let active = true;

    void fetch('/api/social-auth-settings', {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unexpected response: ${response.status}`);
        }

        return response.json() as Promise<SocialAuthSettingsResponse>;
      })
      .then((data) => {
        if (!active) {
          return;
        }

        setCallbackUrls(data?.data?.callbackUrls ?? null);
        setError(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setError(true);
      });

    return () => {
      active = false;
    };
  }, [isSocialAuthSettings]);

  if (!isSocialAuthSettings) {
    return null;
  }

  return (
    <Box
      background="neutral0"
      borderColor="neutral200"
      hasRadius
      padding={6}
      shadow="tableShadow"
    >
      <Flex direction="column" gap={4} alignItems="stretch">
        <Flex direction="column" gap={1} alignItems="stretch">
          <Typography variant="beta">Redirect / callback URL</Typography>
          <Typography textColor="neutral600" variant="omega">
            Эти адреса формируются из публичного URL backend (`server.url`) и API prefix.
          </Typography>
        </Flex>

        <Flex direction="column" gap={4} alignItems="stretch">
          <ProviderHint label="Google callback URL" value={callbackUrls?.google} />
          <ProviderHint label="VK callback URL" value={callbackUrls?.vk} />
          <ProviderHint label="Yandex callback URL" value={callbackUrls?.yandex} />
        </Flex>

        {error ? (
          <Typography textColor="danger600" variant="pi">
            Не удалось получить callback URL автоматически. Проверьте публичный URL backend в настройках сервера.
          </Typography>
        ) : null}
      </Flex>
    </Box>
  );
}
