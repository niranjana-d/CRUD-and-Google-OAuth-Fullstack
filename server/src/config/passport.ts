import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './index';
import { authService } from '../services/authService';

export const configurePassport = (): void => {
  // Only configure Google strategy if credentials are provided
  if (config.googleClientId && config.googleClientSecret &&
      config.googleClientId !== 'your-google-client-id') {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.googleClientId,
          clientSecret: config.googleClientSecret,
          callbackURL: config.googleCallbackUrl,
          scope: ['profile', 'email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            const user = await authService.findOrCreateGoogleUser({
              googleId: profile.id,
              email,
              name: profile.displayName || email.split('@')[0],
              avatarUrl: profile.photos?.[0]?.value || null,
            });

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );

    console.log('✓ Google OAuth strategy configured');
  } else {
    console.log('⚠ Google OAuth not configured (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');
  }
};
