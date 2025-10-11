import React, { createContext, useReducer } from 'react';

// Only keep global state and dispatch for cross-page data
const initialState = {
  contactInfo: null,
  quoteForm: null,
};

function appReducer(
  state: typeof initialState,
  action: { type: string; [key: string]: any }
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

export const AppContext = createContext<{ state: typeof initialState; dispatch: React.Dispatch<any> }>({
  state: initialState,
  dispatch: () => {},
});

export function AppProvider({ children }: React.PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
