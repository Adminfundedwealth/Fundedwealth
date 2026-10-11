const TERMINAL_SSO_ENDPOINT = "https://charts.fundedwealth.com/auth/sso";

export function submitTerminalSSO(token: string): void {
  if (!token) throw new Error("A terminal SSO handoff token is required.");

  const form = document.createElement("form");
  form.method = "POST";
  form.action = TERMINAL_SSO_ENDPOINT;
  form.style.display = "none";

  const tokenInput = document.createElement("input");
  tokenInput.type = "hidden";
  tokenInput.name = "token";
  tokenInput.value = token;
  form.appendChild(tokenInput);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
