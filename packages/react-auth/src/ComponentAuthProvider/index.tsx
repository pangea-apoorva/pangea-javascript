import {
  FC,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";

import AuthNClient from "@src/AuthNClient";
import {
  getStorageAPI,
  getSessionData,
  getUserFromResponse,
  getToken,
  processValidateResponse,
  saveSessionData,
  setCookie,
  removeCookie,
  DEFAULT_COOKIE_OPTIONS,
} from "@src/shared/session";
import {
  APIResponse,
  AuthNConfig,
  AuthUser,
  CookieOptions,
  SessionData,
} from "@src/types";

export interface ComponentAuthContextType {
  authenticated: boolean;
  loading: boolean;
  error: APIResponse | undefined;
  user?: AuthUser;
  client: AuthNClient;
  login: () => void;
  logout: () => void;
  setFlowComplete: (data: any) => void;
}

export interface ComponentAuthProviderProps {
  config: AuthNConfig;
  useCookie?: boolean;
  cookieOptions?: CookieOptions;
  children: ReactNode;
}

const AuthContext = createContext<ComponentAuthContextType>(
  {} as ComponentAuthContextType
);

export const ComponentAuthProvider: FC<ComponentAuthProviderProps> = ({
  config,
  useCookie = false,
  cookieOptions = {},
  children,
}) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<APIResponse>();
  const [user, setUser] = useState<AuthUser>();

  const client = useMemo(() => {
    return new AuthNClient(config);
  }, [config]);

  const combinedCookieOptions: CookieOptions = {
    ...DEFAULT_COOKIE_OPTIONS,
    ...cookieOptions,
  };

  // load data from local storage, and params from URL
  useEffect(() => {
    const storageAPI = getStorageAPI(useCookie);
    const token = useCookie
      ? getToken(combinedCookieOptions.cookieName as string)
      : getToken(combinedCookieOptions.cookieName as string, storageAPI);

    if (token) {
      validate(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validate = async (token: string) => {
    const { success, response } = await client.validate(token);

    if (success) {
      const sessionData: SessionData = processValidateResponse(
        response,
        token,
        useCookie
      );
      setUser(sessionData.user);
      setAuthenticated(true);
    } else {
      setError(response);
    }
    setLoading(false);
  };

  const login = useCallback(async () => {
    // TODO: render AuthFlow
    // is this needed???
  }, []);

  const logout = useCallback(async () => {
    const userToken = user?.active_token.token;

    if (userToken) {
      const { success, response } = await client.logout(userToken);

      if (success) {
        setLoggedOut();
      } else {
        setError(response);
      }
    } else {
      setLoggedOut();
    }
    // eslint-disable-next-line
  }, [user]);

  const setLoggedOut = () => {
    if (useCookie) {
      removeCookie(
        combinedCookieOptions.cookieName as string,
        combinedCookieOptions
      );
    }

    setError(undefined);
    setUser(undefined);
    setAuthenticated(false);
  };

  const setFlowComplete = useCallback((response: APIResponse) => {
    const user: AuthUser = getUserFromResponse(response);
    const storageAPI = getStorageAPI(useCookie);
    const sessionData = getSessionData(storageAPI);
    sessionData.user = user;
    saveSessionData(storageAPI, sessionData);

    if (useCookie) {
      setCookie(
        combinedCookieOptions.cookieName as string,
        response.result?.active_token?.token,
        combinedCookieOptions
      );
    }

    setError(undefined);
    setUser(user);
    setAuthenticated(true);
  }, []);

  const memoData = useMemo(
    () => ({
      authenticated,
      loading,
      error,
      user,
      client,
      login,
      logout,
      setFlowComplete,
    }),
    [
      authenticated,
      loading,
      error,
      user,
      client,
      login,
      logout,
      setFlowComplete,
    ]
  );

  return (
    <AuthContext.Provider value={memoData}>
      <>{children}</>
    </AuthContext.Provider>
  );
};

export const useComponentAuth = () => {
  return useContext(AuthContext);
};
