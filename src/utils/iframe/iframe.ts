import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { onBrowserUnload } from "../eventListener";
import { getStringFromSessionStorageTask } from "../transactions/transactionHelpers";

function createForm(
  formName: string,
  formAction: string,
  formTarget: string,
  inputs: any
) {
  const form: HTMLFormElement = Object.assign(document.createElement("form"), {
    name: formName,
    action: formAction,
    method: "POST",
    target: formTarget
  });

  form.setAttribute("style", "display:none");
  for (const [name, value] of Object.entries(inputs)) {
    form.appendChild(
      Object.assign(document.createElement("input"), {
        name,
        value
      })
    );
  }

  return form;
}

export function createIFrame(container: any, id: string, name: string) {
  const iframe = document.createElement("iframe");

  iframe.setAttribute("id", id);
  iframe.setAttribute("name", name);
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("border", "0");
  iframe.setAttribute("style", "overflow:hidden; position:absolute");

  container.appendChild(iframe);

  return iframe;
}

export function start3DS2MethodStep(
  threeDSMethodUrl: any,
  threeDSMethodData: any,
  myIFrame: any
) {
  // container should be an iframe
  const html = document.createElement("html");
  const body = document.createElement("body");
  const form = createForm(
    "threeDSMethodForm",
    threeDSMethodUrl,
    myIFrame.name,
    {
      threeDSMethodData
    }
  );

  body.appendChild(form);
  html.appendChild(body);
  myIFrame.appendChild(html);
  myIFrame.setAttribute("style", "display:none");

  form.submit();

  return myIFrame;
}

export function start3DS2AcsChallengeStep(
  acsUrl: any,
  params: any,
  container: any
) {
  window.removeEventListener("beforeunload", onBrowserUnload);
  const form = createForm("acsChallengeForm", acsUrl, "_self", params);
  container.appendChild(form);
  form.submit();
}

export function addIFrameMessageListener(
  callbackFunc: (e: MessageEvent<any>) => Promise<void>
) {
  window.addEventListener("message", callbackFunc, false);
}
