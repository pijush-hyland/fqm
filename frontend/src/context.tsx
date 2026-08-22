import React, { createContext, useReducer } from 'react';

// Only keep global state and dispatch for cross-page data
const initialState = {
  contactInfo: null as unknown,
  quoteForm: null as unknown,
};

type AppAction =
  | { type: 'SET_CONTACT_INFO'; payload: unknown }
  | { type: 'SET_QUOTE_FORM'; payload: unknown };

function appReducer(
  state: typeof initialState,
  action: AppAction
) {
  switch (action.type) {
    case 'SET_CONTACT_INFO':
      return { ...state, contactInfo: action.payload };
    case 'SET_QUOTE_FORM':
      return { ...state, quoteForm: action.payload };
    default:
      return state;
  }
}

export const AppContext = createContext<{ state: typeof initialState; dispatch: React.Dispatch<AppAction> }>({
  state: initialState,
  dispatch: () => {},
});

export function AppProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
