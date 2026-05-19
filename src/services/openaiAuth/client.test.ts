import { describe, expect, test } from 'bun:test'
import {
  buildOpenAIAuthorizeUrl,
  generateOpenAICodeVerifier,
  generateOpenAIState,
  OPENAI_CODEX_CLIENT_ID,
} from './client.js'

describe('OpenAI Codex OAuth client', () => {
  test('generates hex PKCE verifier and state like the Codex-compatible flow', () => {
    const verifier = generateOpenAICodeVerifier()
    const state = generateOpenAIState()

    expect(verifier).toMatch(/^[a-f0-9]{128}$/)
    expect(state).toMatch(/^[a-f0-9]{64}$/)
  })

  test('builds authorize URL without non-Codex originator parameter', () => {
    const authorizeUrl = buildOpenAIAuthorizeUrl({
      redirectUri: 'http://localhost:1455/auth/callback',
      codeVerifier: 'a'.repeat(128),
      state: 'b'.repeat(64),
    })
    const parsed = new URL(authorizeUrl)
    const params = parsed.searchParams

    expect(parsed.origin + parsed.pathname).toBe(
      'https://auth.openai.com/oauth/authorize',
    )
    expect(params.get('client_id')).toBe(OPENAI_CODEX_CLIENT_ID)
    expect(params.get('redirect_uri')).toBe(
      'http://localhost:1455/auth/callback',
    )
    expect(params.get('scope')).toBe('openid profile email offline_access')
    expect(params.get('code_challenge_method')).toBe('S256')
    expect(params.get('id_token_add_organizations')).toBe('true')
    expect(params.get('codex_cli_simplified_flow')).toBe('true')
    expect(params.has('originator')).toBe(false)
  })
})
