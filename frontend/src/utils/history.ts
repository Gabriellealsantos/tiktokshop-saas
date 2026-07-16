// Ponte de navegação usável fora de componentes React (ex.: interceptor do axios).
// Por padrão usa window.location; a SPA registra o navigate do react-router via setNavigator
// para navegação client-side sem reload.

type NavigateFn = (to: string, options?: { replace?: boolean }) => void;

let navigator: NavigateFn = (to) => {
  window.location.assign(to);
};

export const history = {
  push: (to: string) => navigator(to),
  replace: (to: string) => navigator(to, { replace: true }),
  setNavigator: (fn: NavigateFn) => {
    navigator = fn;
  },
};
