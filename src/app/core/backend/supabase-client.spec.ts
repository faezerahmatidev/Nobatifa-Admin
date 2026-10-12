import { TestBed } from '@angular/core/testing';
import {
  createSupabaseClient,
  SUPABASE_CLIENT,
  SUPABASE_CLIENT_PROVIDER,
} from './supabase-client';
import { environment } from '../../../environments/environment';

describe('Supabase client foundation', () => {
  it('throws a clear error when unconfigured', () => {
    const url = environment.supabaseUrl;
    const key = environment.supabasePublishableKey;
    environment.supabaseUrl = '';
    environment.supabasePublishableKey = '';
    try {
      expect(() => createSupabaseClient()).toThrow(/not configured/);
    } finally {
      environment.supabaseUrl = url;
      environment.supabasePublishableKey = key;
    }
  });

  it('creates a usable client when configured', () => {
    const url = environment.supabaseUrl;
    const key = environment.supabasePublishableKey;
    environment.supabaseUrl = 'https://example.supabase.co';
    environment.supabasePublishableKey = 'publishable-test-key';
    try {
      const client = createSupabaseClient();
      expect(typeof client.from).toBe('function');
      expect(typeof client.auth.signOut).toBe('function');
    } finally {
      environment.supabaseUrl = url;
      environment.supabasePublishableKey = key;
    }
  });

  it('is injectable through the provider token', () => {
    const url = environment.supabaseUrl;
    const key = environment.supabasePublishableKey;
    environment.supabaseUrl = 'https://example.supabase.co';
    environment.supabasePublishableKey = 'publishable-test-key';
    try {
      TestBed.configureTestingModule({ providers: [SUPABASE_CLIENT_PROVIDER] });
      expect(typeof TestBed.inject(SUPABASE_CLIENT).from).toBe('function');
    } finally {
      environment.supabaseUrl = url;
      environment.supabasePublishableKey = key;
    }
  });
});
