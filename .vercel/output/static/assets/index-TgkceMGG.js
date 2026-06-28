import{a as c,b as Fr}from"./icons-BfFS3Mv0.js";import{a as Js,j as e}from"./radix-BPnatEAW.js";import"./supabase-D1S55ZRl.js";var Hr=`.styles-module__popup___IhzrD svg[fill=none] {
  fill: none !important;
}
.styles-module__popup___IhzrD svg[fill=none] :not([fill]) {
  fill: none !important;
}

@keyframes styles-module__popupEnter___AuQDN {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
}
@keyframes styles-module__popupExit___JJKQX {
  from {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
}
@keyframes styles-module__shake___jdbWe {
  0%, 100% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(0);
  }
  20% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-3px);
  }
  40% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(3px);
  }
  60% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-2px);
  }
  80% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(2px);
  }
}
.styles-module__popup___IhzrD {
  position: fixed;
  transform: translateX(-50%);
  width: 280px;
  padding: 0.75rem 1rem 14px;
  background: #1a1a1a;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  z-index: 100001;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  will-change: transform, opacity;
  opacity: 0;
}
.styles-module__popup___IhzrD.styles-module__enter___L7U7N {
  animation: styles-module__popupEnter___AuQDN 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.styles-module__popup___IhzrD.styles-module__entered___COX-w {
  opacity: 1;
  transform: translateX(-50%) scale(1) translateY(0);
}
.styles-module__popup___IhzrD.styles-module__exit___5eGjE {
  animation: styles-module__popupExit___JJKQX 0.15s ease-in forwards;
}
.styles-module__popup___IhzrD.styles-module__entered___COX-w.styles-module__shake___jdbWe {
  animation: styles-module__shake___jdbWe 0.25s ease-out;
}

.styles-module__header___wWsSi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5625rem;
}

.styles-module__element___fTV2z {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.styles-module__headerToggle___WpW0b {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  text-align: left;
}
.styles-module__headerToggle___WpW0b .styles-module__element___fTV2z {
  flex: 1;
}

.styles-module__chevron___ZZJlR {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}
.styles-module__chevron___ZZJlR.styles-module__expanded___2Hxgv {
  transform: rotate(90deg);
}

.styles-module__stylesWrapper___pnHgy {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.styles-module__stylesWrapper___pnHgy.styles-module__expanded___2Hxgv {
  grid-template-rows: 1fr;
}

.styles-module__stylesInner___YYZe2 {
  overflow: hidden;
}

.styles-module__stylesBlock___VfQKn {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.6875rem;
  line-height: 1.5;
}

.styles-module__styleLine___1YQiD {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
}

.styles-module__styleProperty___84L1i {
  color: #c792ea;
}

.styles-module__styleValue___q51-h {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__timestamp___Dtpsv {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.styles-module__quote___mcMmQ {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  line-height: 1.45;
}

.styles-module__textarea___jrSae {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem 0.625rem;
  font-size: 0.8125rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
}
.styles-module__textarea___jrSae:focus {
  border-color: var(--agentation-color-blue);
}
.styles-module__textarea___jrSae.styles-module__green___99l3h:focus {
  border-color: var(--agentation-color-green);
}
.styles-module__textarea___jrSae::placeholder {
  color: rgba(255, 255, 255, 0.35);
}
.styles-module__textarea___jrSae::-webkit-scrollbar {
  width: 6px;
}
.styles-module__textarea___jrSae::-webkit-scrollbar-track {
  background: transparent;
}
.styles-module__textarea___jrSae::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.styles-module__actions___D6x3f {
  display: flex;
  justify-content: flex-end;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.styles-module__cancel___hRjnL,
.styles-module__submit___K-mIR {
  padding: 0.4rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.styles-module__cancel___hRjnL {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__cancel___hRjnL:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.styles-module__submit___K-mIR {
  color: white;
}
.styles-module__submit___K-mIR:hover:not(:disabled) {
  filter: brightness(0.9);
}
.styles-module__submit___K-mIR:disabled {
  cursor: not-allowed;
}

.styles-module__deleteWrapper___oSjdo {
  margin-right: auto;
}

.styles-module__deleteButton___4VuAE {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.styles-module__deleteButton___4VuAE:hover {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}
.styles-module__deleteButton___4VuAE:active {
  transform: scale(0.92);
}

.styles-module__light___6AaSQ.styles-module__popup___IhzrD {
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.styles-module__light___6AaSQ .styles-module__element___fTV2z {
  color: rgba(0, 0, 0, 0.6);
}
.styles-module__light___6AaSQ .styles-module__timestamp___Dtpsv {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__chevron___ZZJlR {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__stylesBlock___VfQKn {
  background: rgba(0, 0, 0, 0.03);
}
.styles-module__light___6AaSQ .styles-module__styleLine___1YQiD {
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__styleProperty___84L1i {
  color: #7c3aed;
}
.styles-module__light___6AaSQ .styles-module__styleValue___q51-h {
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__quote___mcMmQ {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.04);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae {
  background: rgba(0, 0, 0, 0.03);
  color: #1a1a1a;
  border-color: rgba(0, 0, 0, 0.12);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae::placeholder {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
}
.styles-module__light___6AaSQ .styles-module__cancel___hRjnL {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___6AaSQ .styles-module__cancel___hRjnL:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__deleteButton___4VuAE {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__deleteButton___4VuAE:hover {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}`,Yr={popup:"styles-module__popup___IhzrD",enter:"styles-module__enter___L7U7N",entered:"styles-module__entered___COX-w",exit:"styles-module__exit___5eGjE",shake:"styles-module__shake___jdbWe",header:"styles-module__header___wWsSi",element:"styles-module__element___fTV2z",headerToggle:"styles-module__headerToggle___WpW0b",chevron:"styles-module__chevron___ZZJlR",expanded:"styles-module__expanded___2Hxgv",stylesWrapper:"styles-module__stylesWrapper___pnHgy",stylesInner:"styles-module__stylesInner___YYZe2",stylesBlock:"styles-module__stylesBlock___VfQKn",styleLine:"styles-module__styleLine___1YQiD",styleProperty:"styles-module__styleProperty___84L1i",styleValue:"styles-module__styleValue___q51-h",timestamp:"styles-module__timestamp___Dtpsv",quote:"styles-module__quote___mcMmQ",textarea:"styles-module__textarea___jrSae",actions:"styles-module__actions___D6x3f",cancel:"styles-module__cancel___hRjnL",submit:"styles-module__submit___K-mIR",deleteWrapper:"styles-module__deleteWrapper___oSjdo",deleteButton:"styles-module__deleteButton___4VuAE",light:"styles-module__light___6AaSQ"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-annotation-popup-css-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-annotation-popup-css-styles",document.head.appendChild(t)),t.textContent=Hr}var qe=Yr,Xr=`.icon-transitions-module__iconState___uqK9J {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: center;
}

.icon-transitions-module__iconStateFast___HxlMm {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: center;
}

.icon-transitions-module__iconFade___nPwXg {
  transition: opacity 0.2s ease;
}

.icon-transitions-module__iconFadeFast___Ofb2t {
  transition: opacity 0.15s ease;
}

.icon-transitions-module__visible___PlHsU {
  opacity: 1 !important;
}

.icon-transitions-module__visibleScaled___8Qog- {
  opacity: 1 !important;
  transform: scale(1);
}

.icon-transitions-module__hidden___ETykt {
  opacity: 0 !important;
}

.icon-transitions-module__hiddenScaled___JXn-m {
  opacity: 0 !important;
  transform: scale(0.8);
}

.icon-transitions-module__sending___uaLN- {
  opacity: 0.5 !important;
  transform: scale(0.8);
}`,Ur={iconState:"icon-transitions-module__iconState___uqK9J",iconStateFast:"icon-transitions-module__iconStateFast___HxlMm",iconFade:"icon-transitions-module__iconFade___nPwXg",iconFadeFast:"icon-transitions-module__iconFadeFast___Ofb2t",visible:"icon-transitions-module__visible___PlHsU",visibleScaled:"icon-transitions-module__visibleScaled___8Qog-",hidden:"icon-transitions-module__hidden___ETykt",hiddenScaled:"icon-transitions-module__hiddenScaled___JXn-m",sending:"icon-transitions-module__sending___uaLN-"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-components-icon-transitions");t||(t=document.createElement("style"),t.id="feedback-tool-styles-components-icon-transitions",document.head.appendChild(t)),t.textContent=Xr}var Ee=Ur,dc=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M4 4l8 8M12 4l-8 8",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})}),Qr=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M8 3v10M3 8h10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})}),_c=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M3 8l3.5 3.5L13 5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),uc=({size:t=14})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M3.9375 7L6.125 9.1875L10.5 4.8125",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),Vr=({size:t=24,style:n={}})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",style:n,children:[e.jsxs("g",{clipPath:"url(#clip0_list_sparkle)",children:[e.jsx("path",{d:"M11.5 12L5.5 12",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M18.5 6.75L5.5 6.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9.25 17.25L5.5 17.25",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M16 12.75L16.5179 13.9677C16.8078 14.6494 17.3506 15.1922 18.0323 15.4821L19.25 16L18.0323 16.5179C17.3506 16.8078 16.8078 17.3506 16.5179 18.0323L16 19.25L15.4821 18.0323C15.1922 17.3506 14.6494 16.8078 13.9677 16.5179L12.75 16L13.9677 15.4821C14.6494 15.1922 15.1922 14.6494 15.4821 13.9677L16 12.75Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinejoin:"round"})]}),e.jsx("defs",{children:e.jsx("clipPath",{id:"clip0_list_sparkle",children:e.jsx("rect",{width:"24",height:"24",fill:"white"})})})]}),qr=({size:t=20,...n})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...n,children:[e.jsx("circle",{cx:"10",cy:"10",r:"5.375",stroke:"currentColor",strokeWidth:"1.25"}),e.jsx("path",{d:"M8.5 8.5C8.73 7.85 9.31 7.49 10 7.5C10.86 7.51 11.5 8.13 11.5 9C11.5 10.08 10 10.5 10 10.5V10.75",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"10",cy:"12.625",r:"0.625",fill:"currentColor"})]}),hc=({size:t=14})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 14 14",fill:"none",children:[e.jsx("style",{children:`
      @keyframes checkDraw {
        0% {
          stroke-dashoffset: 12;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
      @keyframes checkBounce {
        0% {
          transform: scale(0.5);
          opacity: 0;
        }
        50% {
          transform: scale(1.12);
          opacity: 1;
        }
        75% {
          transform: scale(0.95);
        }
        100% {
          transform: scale(1);
        }
      }
      .check-path-animated {
        stroke-dasharray: 12;
        stroke-dashoffset: 0;
        transform-origin: center;
        animation: checkDraw 0.18s ease-out, checkBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    `}),e.jsx("path",{className:"check-path-animated",d:"M3.9375 7L6.125 9.1875L10.5 4.8125",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),mc=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),Kr=({size:t=24,copied:n=!1,tint:o})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",style:o?{color:o,transition:"color 0.3s ease"}:void 0,children:[e.jsxs("g",{className:`${Ee.iconState} ${n?Ee.hiddenScaled:Ee.visibleScaled}`,children:[e.jsx("path",{d:"M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsxs("g",{className:`${Ee.iconState} ${n?Ee.visibleScaled:Ee.hiddenScaled}`,children:[e.jsx("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 10L11 14.25L9.25 12.25",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})]}),Gr=({size:t=24,state:n="idle"})=>{const o=n==="idle",s=n==="sent",r=n==="failed",i=n==="sending";return e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("g",{className:`${Ee.iconStateFast} ${o?Ee.visibleScaled:i?Ee.sending:Ee.hiddenScaled}`,children:e.jsx("path",{d:"M9.875 14.125L12.3506 19.6951C12.7184 20.5227 13.9091 20.4741 14.2083 19.6193L18.8139 6.46032C19.0907 5.6695 18.3305 4.90933 17.5397 5.18611L4.38072 9.79174C3.52589 10.0909 3.47731 11.2816 4.30494 11.6494L9.875 14.125ZM9.875 14.125L13.375 10.625",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsxs("g",{className:`${Ee.iconStateFast} ${s?Ee.visibleScaled:Ee.hiddenScaled}`,children:[e.jsx("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 10L11 14.25L9.25 12.25",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),e.jsxs("g",{className:`${Ee.iconStateFast} ${r?Ee.visibleScaled:Ee.hiddenScaled}`,children:[e.jsx("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-red)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M12 8V12",stroke:"var(--agentation-color-red)",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"12",cy:"15",r:"0.5",fill:"var(--agentation-color-red)",stroke:"var(--agentation-color-red)",strokeWidth:"1"})]})]})},gc=({size:t=24,sent:n=!1})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 22 21",fill:"none",children:[e.jsxs("g",{className:`${Ee.iconState} ${n?Ee.hiddenScaled:Ee.visibleScaled}`,children:[e.jsx("path",{d:"M9.5 5H6.5C4.84315 5 3.5 6.34315 3.5 8V15C3.5 16.6569 4.84315 18 6.5 18H13.5C15.1569 18 16.5 16.6569 16.5 15V12",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M13.5 8.5L18.5 3.5M18.5 3.5L14.4524 3.5M18.5 3.5L18.5 7.54762",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M7.5 13.75H12.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M7.5 10.75H10.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsxs("g",{className:`${Ee.iconState} ${n?Ee.visibleScaled:Ee.hiddenScaled}`,children:[e.jsx("path",{d:"M11 19C6.58172 19 3 15.4182 3 11C3 6.58172 6.58172 3 11 3C15.4182 3 19 6.58172 19 11C19 15.4182 15.4182 19 11 19Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M14 9L10 13.25L8.25 11.25",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})]}),pc=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.91516 12.7108C4.63794 12.2883 4.63705 11.7565 4.91242 11.3328C5.84146 9.9033 8.30909 6.74994 12 6.74994C15.6909 6.74994 18.1585 9.9033 19.0876 11.3328C19.3629 11.7565 19.3621 12.2883 19.0848 12.7108C18.1537 14.13 15.6873 17.2499 12 17.2499C8.31272 17.2499 5.8463 14.13 4.91516 12.7108Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),fc=({size:t=24})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M3.91752 12.7539C3.65127 12.2996 3.65037 11.7515 3.9149 11.2962C4.9042 9.59346 7.72688 5.49994 12 5.49994C16.2731 5.49994 19.0958 9.59346 20.0851 11.2962C20.3496 11.7515 20.3487 12.2996 20.0825 12.7539C19.0908 14.4459 16.2694 18.4999 12 18.4999C7.73064 18.4999 4.90918 14.4459 3.91752 12.7539Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M12 14.8261C13.5608 14.8261 14.8261 13.5608 14.8261 12C14.8261 10.4392 13.5608 9.17392 12 9.17392C10.4392 9.17392 9.17391 10.4392 9.17391 12C9.17391 13.5608 10.4392 14.8261 12 14.8261Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),yc=({size:t=24})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M18.6025 9.28503C18.9174 8.9701 19.4364 8.99481 19.7015 9.35271C20.1484 9.95606 20.4943 10.507 20.7342 10.9199C21.134 11.6086 21.1329 12.4454 20.7303 13.1328C20.2144 14.013 19.2151 15.5225 17.7723 16.8193C16.3293 18.1162 14.3852 19.2497 12.0008 19.25C11.4192 19.25 10.8638 19.1823 10.3355 19.0613C9.77966 18.934 9.63498 18.2525 10.0382 17.8493C10.2412 17.6463 10.5374 17.573 10.8188 17.6302C11.1993 17.7076 11.5935 17.75 12.0008 17.75C13.8848 17.7497 15.4867 16.8568 16.7693 15.7041C18.0522 14.5511 18.9606 13.1867 19.4363 12.375C19.5656 12.1543 19.5659 11.8943 19.4373 11.6729C19.2235 11.3049 18.921 10.8242 18.5364 10.3003C18.3085 9.98991 18.3302 9.5573 18.6025 9.28503ZM12.0008 4.75C12.5814 4.75006 13.1358 4.81803 13.6632 4.93953C14.2182 5.06741 14.362 5.74812 13.9593 6.15091C13.7558 6.35435 13.4589 6.42748 13.1771 6.36984C12.7983 6.29239 12.4061 6.25006 12.0008 6.25C10.1167 6.25 8.51415 7.15145 7.23028 8.31543C5.94678 9.47919 5.03918 10.8555 4.56426 11.6729C4.43551 11.8945 4.43582 12.1542 4.56524 12.375C4.77587 12.7343 5.07189 13.2012 5.44718 13.7105C5.67623 14.0213 5.65493 14.4552 5.38193 14.7282C5.0671 15.0431 4.54833 15.0189 4.28292 14.6614C3.84652 14.0736 3.50813 13.5369 3.27129 13.1328C2.86831 12.4451 2.86717 11.6088 3.26739 10.9199C3.78185 10.0345 4.77959 8.51239 6.22247 7.2041C7.66547 5.89584 9.61202 4.75 12.0008 4.75Z",fill:"currentColor"}),e.jsx("path",{d:"M5 19L19 5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),Zr=({size:t=24,isOpen:n=!0})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsxs("g",{className:`${Ee.iconFade} ${n?Ee.visible:Ee.hidden}`,children:[e.jsx("path",{d:"M3.91752 12.7539C3.65127 12.2996 3.65037 11.7515 3.9149 11.2962C4.9042 9.59346 7.72688 5.49994 12 5.49994C16.2731 5.49994 19.0958 9.59346 20.0851 11.2962C20.3496 11.7515 20.3487 12.2996 20.0825 12.7539C19.0908 14.4459 16.2694 18.4999 12 18.4999C7.73064 18.4999 4.90918 14.4459 3.91752 12.7539Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M12 14.8261C13.5608 14.8261 14.8261 13.5608 14.8261 12C14.8261 10.4392 13.5608 9.17392 12 9.17392C10.4392 9.17392 9.17391 10.4392 9.17391 12C9.17391 13.5608 10.4392 14.8261 12 14.8261Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),e.jsxs("g",{className:`${Ee.iconFade} ${n?Ee.hidden:Ee.visible}`,children:[e.jsx("path",{d:"M18.6025 9.28503C18.9174 8.9701 19.4364 8.99481 19.7015 9.35271C20.1484 9.95606 20.4943 10.507 20.7342 10.9199C21.134 11.6086 21.1329 12.4454 20.7303 13.1328C20.2144 14.013 19.2151 15.5225 17.7723 16.8193C16.3293 18.1162 14.3852 19.2497 12.0008 19.25C11.4192 19.25 10.8638 19.1823 10.3355 19.0613C9.77966 18.934 9.63498 18.2525 10.0382 17.8493C10.2412 17.6463 10.5374 17.573 10.8188 17.6302C11.1993 17.7076 11.5935 17.75 12.0008 17.75C13.8848 17.7497 15.4867 16.8568 16.7693 15.7041C18.0522 14.5511 18.9606 13.1867 19.4363 12.375C19.5656 12.1543 19.5659 11.8943 19.4373 11.6729C19.2235 11.3049 18.921 10.8242 18.5364 10.3003C18.3085 9.98991 18.3302 9.5573 18.6025 9.28503ZM12.0008 4.75C12.5814 4.75006 13.1358 4.81803 13.6632 4.93953C14.2182 5.06741 14.362 5.74812 13.9593 6.15091C13.7558 6.35435 13.4589 6.42748 13.1771 6.36984C12.7983 6.29239 12.4061 6.25006 12.0008 6.25C10.1167 6.25 8.51415 7.15145 7.23028 8.31543C5.94678 9.47919 5.03918 10.8555 4.56426 11.6729C4.43551 11.8945 4.43582 12.1542 4.56524 12.375C4.77587 12.7343 5.07189 13.2012 5.44718 13.7105C5.67623 14.0213 5.65493 14.4552 5.38193 14.7282C5.0671 15.0431 4.54833 15.0189 4.28292 14.6614C3.84652 14.0736 3.50813 13.5369 3.27129 13.1328C2.86831 12.4451 2.86717 11.6088 3.26739 10.9199C3.78185 10.0345 4.77959 8.51239 6.22247 7.2041C7.66547 5.89584 9.61202 4.75 12.0008 4.75Z",fill:"currentColor"}),e.jsx("path",{d:"M5 19L19 5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})]}),Jr=({size:t=24,isPaused:n=!1})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsxs("g",{className:`${Ee.iconFadeFast} ${n?Ee.hidden:Ee.visible}`,children:[e.jsx("path",{d:"M8 6L8 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M16 18L16 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("path",{className:`${Ee.iconFadeFast} ${n?Ee.visible:Ee.hidden}`,d:"M17.75 10.701C18.75 11.2783 18.75 12.7217 17.75 13.299L8.75 18.4952C7.75 19.0725 6.5 18.3509 6.5 17.1962L6.5 6.80384C6.5 5.64914 7.75 4.92746 8.75 5.50481L17.75 10.701Z",stroke:"currentColor",strokeWidth:"1.5"})]}),xc=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M4.91516 12.7108C4.63794 12.2883 4.63705 11.7565 4.91242 11.3328C5.84146 9.9033 8.30909 6.74994 12 6.74994C15.6909 6.74994 18.1585 9.9033 19.0876 11.3328C19.3629 11.7565 19.3621 12.2883 19.0848 12.7108C18.1537 14.13 15.6873 17.2499 12 17.2499C8.31272 17.2499 5.8463 14.13 4.91516 12.7108Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 12H15",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),ei=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M10.6504 5.81117C10.9939 4.39628 13.0061 4.39628 13.3496 5.81117C13.5715 6.72517 14.6187 7.15891 15.4219 6.66952C16.6652 5.91193 18.0881 7.33479 17.3305 8.57815C16.8411 9.38134 17.2748 10.4285 18.1888 10.6504C19.6037 10.9939 19.6037 13.0061 18.1888 13.3496C17.2748 13.5715 16.8411 14.6187 17.3305 15.4219C18.0881 16.6652 16.6652 18.0881 15.4219 17.3305C14.6187 16.8411 13.5715 17.2748 13.3496 18.1888C13.0061 19.6037 10.9939 19.6037 10.6504 18.1888C10.4285 17.2748 9.38135 16.8411 8.57815 17.3305C7.33479 18.0881 5.91193 16.6652 6.66952 15.4219C7.15891 14.6187 6.72517 13.5715 5.81117 13.3496C4.39628 13.0061 4.39628 10.9939 5.81117 10.6504C6.72517 10.4285 7.15891 9.38134 6.66952 8.57815C5.91193 7.33479 7.33479 5.91192 8.57815 6.66952C9.38135 7.15891 10.4285 6.72517 10.6504 5.81117Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:"12",cy:"12",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"})]}),bc=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M9.25 5.75C9.80228 5.75 10.25 6.19772 10.25 6.75L10.25 17.25C10.25 17.8023 9.80228 18.25 9.25 18.25L6.75 18.25C6.19772 18.25 5.75 17.8023 5.75 17.25L5.75 6.75C5.75 6.19772 6.19772 5.75 6.75 5.75L9.25 5.75Z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M17.25 5.75C17.8023 5.75 18.25 6.19772 18.25 6.75L18.25 17.25C18.25 17.8023 17.8023 18.25 17.25 18.25L14.75 18.25C14.1977 18.25 13.75 17.8023 13.75 17.25L13.75 6.75C13.75 6.19772 14.1977 5.75 14.75 5.75L17.25 5.75Z",stroke:"currentColor",strokeWidth:"1.5"})]}),wc=({size:t=24})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M8 6L8 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M16 18L16 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),vc=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M17.75 10.701C18.75 11.2783 18.75 12.7217 17.75 13.299L8.75 18.4952C7.75 19.0725 6.5 18.3509 6.5 17.1962L6.5 6.80384C6.5 5.64914 7.75 4.92746 8.75 5.50481L17.75 10.701Z",stroke:"currentColor",strokeWidth:"1.5"})}),ti=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M13.5 4C14.7426 4 15.75 5.00736 15.75 6.25V7H18.5C18.9142 7 19.25 7.33579 19.25 7.75C19.25 8.16421 18.9142 8.5 18.5 8.5H17.9678L17.6328 16.2217C17.61 16.7475 17.5912 17.1861 17.5469 17.543C17.5015 17.9087 17.4225 18.2506 17.2461 18.5723C16.9747 19.0671 16.5579 19.4671 16.0518 19.7168C15.7227 19.8791 15.3772 19.9422 15.0098 19.9717C14.6514 20.0004 14.2126 20 13.6865 20H10.3135C9.78735 20 9.34856 20.0004 8.99023 19.9717C8.62278 19.9422 8.27729 19.8791 7.94824 19.7168C7.44205 19.4671 7.02532 19.0671 6.75391 18.5723C6.57751 18.2506 6.49853 17.9087 6.45312 17.543C6.40883 17.1861 6.39005 16.7475 6.36719 16.2217L6.03223 8.5H5.5C5.08579 8.5 4.75 8.16421 4.75 7.75C4.75 7.33579 5.08579 7 5.5 7H8.25V6.25C8.25 5.00736 9.25736 4 10.5 4H13.5ZM7.86621 16.1562C7.89013 16.7063 7.90624 17.0751 7.94141 17.3584C7.97545 17.6326 8.02151 17.7644 8.06934 17.8516C8.19271 18.0763 8.38239 18.2577 8.6123 18.3711C8.70153 18.4151 8.83504 18.4545 9.11035 18.4766C9.39482 18.4994 9.76335 18.5 10.3135 18.5H13.6865C14.2367 18.5 14.6052 18.4994 14.8896 18.4766C15.165 18.4545 15.2985 18.4151 15.3877 18.3711C15.6176 18.2577 15.8073 18.0763 15.9307 17.8516C15.9785 17.7644 16.0245 17.6326 16.0586 17.3584C16.0938 17.0751 16.1099 16.7063 16.1338 16.1562L16.4668 8.5H7.5332L7.86621 16.1562ZM9.97656 10.75C10.3906 10.7371 10.7371 11.0626 10.75 11.4766L10.875 15.4766C10.8879 15.8906 10.5624 16.2371 10.1484 16.25C9.73443 16.2629 9.38794 15.9374 9.375 15.5234L9.25 11.5234C9.23706 11.1094 9.56255 10.7629 9.97656 10.75ZM14.0244 10.75C14.4384 10.7635 14.7635 11.1105 14.75 11.5244L14.6201 15.5244C14.6066 15.9384 14.2596 16.2634 13.8457 16.25C13.4317 16.2365 13.1067 15.8896 13.1201 15.4756L13.251 11.4756C13.2645 11.0617 13.6105 10.7366 14.0244 10.75ZM10.5 5.5C10.0858 5.5 9.75 5.83579 9.75 6.25V7H14.25V6.25C14.25 5.83579 13.9142 5.5 13.5 5.5H10.5Z",fill:"currentColor"})}),kc=({size:t=16,style:n={}})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",style:n,children:[e.jsx("path",{d:"M18.8875 19.25L19.6112 19.0533C19.6823 19.3148 19.6068 19.5943 19.4137 19.7844C19.2206 19.9746 18.9399 20.0457 18.6795 19.9706L18.8875 19.25ZM14.9631 18.244L15.263 18.9314L14.9631 18.244ZM18.0914 15.6309L17.4669 15.2156L18.0914 15.6309ZM4.75 11.8041H5.5C5.5 15.2664 8.39065 18.1081 12 18.1081V18.8581V19.6081C7.60123 19.6081 4 16.1334 4 11.8041H4.75ZM19.25 11.8041H18.5C18.5 8.34166 15.6094 5.5 12 5.5V4.75V4C16.3988 4 20 7.47476 20 11.8041H19.25ZM12 4.75V5.5C8.39065 5.5 5.5 8.34166 5.5 11.8041H4.75H4C4 7.47476 7.60123 4 12 4V4.75ZM18.0914 15.6309L17.4669 15.2156C18.1213 14.2315 18.5 13.0612 18.5 11.8041H19.25H20C20 13.3681 19.5276 14.8257 18.716 16.0462L18.0914 15.6309ZM18.8875 19.25L18.1638 19.4467L17.2953 16.2517L18.019 16.055L18.7428 15.8583L19.6112 19.0533L18.8875 19.25ZM12 18.8581V18.1081C12.9509 18.1081 13.8518 17.9105 14.6632 17.5565L14.9631 18.244L15.263 18.9314C14.2652 19.3667 13.1603 19.6081 12 19.6081V18.8581ZM15.3144 18.2188L15.5224 17.4982L19.0955 18.5294L18.8875 19.25L18.6795 19.9706L15.1064 18.9394L15.3144 18.2188ZM14.9631 18.244L14.6632 17.5565C14.925 17.4423 15.2286 17.4134 15.5224 17.4982L15.3144 18.2188L15.1064 18.9394C15.1677 18.957 15.223 18.9489 15.263 18.9314L14.9631 18.244ZM18.0914 15.6309L18.716 16.0462C18.7451 16.0024 18.7636 15.9351 18.7428 15.8583L18.019 16.055L17.2953 16.2517C17.1957 15.8853 17.2716 15.5093 17.4669 15.2156L18.0914 15.6309Z",fill:"currentColor"}),e.jsx("circle",{cx:"15",cy:"11.75",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"12",cy:"11.75",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"9",cy:"11.75",r:"1",fill:"currentColor"})]}),jc=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("g",{clipPath:"url(#clip0_2_45)",children:e.jsx("path",{d:"M16.25 8.75L10 15.25L7.25 12.25",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("defs",{children:e.jsx("clipPath",{id:"clip0_2_45",children:e.jsx("rect",{width:"24",height:"24",fill:"white"})})})]}),Cc=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("g",{clipPath:"url(#clip0_2_37)",children:e.jsx("path",{d:"M17.5962 7.75L9.42308 16.25L6.15385 12.6538",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("defs",{children:e.jsx("clipPath",{id:"clip0_2_37",children:e.jsx("rect",{width:"24",height:"24",fill:"white"})})})]}),Sc=({size:t=24})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsxs("g",{clipPath:"url(#clip0_checkmark_circle)",children:[e.jsx("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M15 10L11 14.25L9.25 12.25",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),e.jsx("defs",{children:e.jsx("clipPath",{id:"clip0_checkmark_circle",children:e.jsx("rect",{width:"24",height:"24",fill:"white"})})})]}),er=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsxs("g",{clipPath:"url(#clip0_2_53)",children:[e.jsx("path",{d:"M16.25 16.25L7.75 7.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M7.75 16.25L16.25 7.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),e.jsx("defs",{children:e.jsx("clipPath",{id:"clip0_2_53",children:e.jsx("rect",{width:"24",height:"24",fill:"white"})})})]}),ni=({size:t=24})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M16.7198 6.21973C17.0127 5.92683 17.4874 5.92683 17.7803 6.21973C18.0732 6.51262 18.0732 6.9874 17.7803 7.28027L13.0606 12L17.7803 16.7197C18.0732 17.0126 18.0732 17.4874 17.7803 17.7803C17.4875 18.0731 17.0127 18.0731 16.7198 17.7803L12.0001 13.0605L7.28033 17.7803C6.98746 18.0731 6.51268 18.0731 6.21979 17.7803C5.92689 17.4874 5.92689 17.0126 6.21979 16.7197L10.9395 12L6.21979 7.28027C5.92689 6.98738 5.92689 6.51262 6.21979 6.21973C6.51268 5.92683 6.98744 5.92683 7.28033 6.21973L12.0001 10.9395L16.7198 6.21973Z",fill:"currentColor"})}),oi=({size:t=16})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M9.99999 12.7082C11.4958 12.7082 12.7083 11.4956 12.7083 9.99984C12.7083 8.50407 11.4958 7.2915 9.99999 7.2915C8.50422 7.2915 7.29166 8.50407 7.29166 9.99984C7.29166 11.4956 8.50422 12.7082 9.99999 12.7082Z",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M10 3.9585V5.05698",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M10 14.9429V16.0414",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5.7269 5.72656L6.50682 6.50649",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M13.4932 13.4932L14.2731 14.2731",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M3.95834 10H5.05683",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M14.9432 10H16.0417",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5.7269 14.2731L6.50682 13.4932",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M13.4932 6.50649L14.2731 5.72656",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"})]}),si=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 20 20",fill:"none",children:e.jsx("path",{d:"M15.5 10.4955C15.4037 11.5379 15.0124 12.5314 14.3721 13.3596C13.7317 14.1878 12.8688 14.8165 11.8841 15.1722C10.8995 15.5278 9.83397 15.5957 8.81217 15.3679C7.79038 15.1401 6.8546 14.6259 6.11434 13.8857C5.37408 13.1454 4.85995 12.2096 4.63211 11.1878C4.40427 10.166 4.47215 9.10048 4.82781 8.11585C5.18346 7.13123 5.81218 6.26825 6.64039 5.62791C7.4686 4.98756 8.46206 4.59634 9.5045 4.5C8.89418 5.32569 8.60049 6.34302 8.67685 7.36695C8.75321 8.39087 9.19454 9.35339 9.92058 10.0794C10.6466 10.8055 11.6091 11.2468 12.6331 11.3231C13.657 11.3995 14.6743 11.1058 15.5 10.4955Z",stroke:"currentColor",strokeWidth:"1.13793",strokeLinecap:"round",strokeLinejoin:"round"})}),ri=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M11.3799 6.9572L9.05645 4.63375M11.3799 6.9572L6.74949 11.5699C6.61925 11.6996 6.45577 11.791 6.277 11.8339L4.29549 12.3092C3.93194 12.3964 3.60478 12.0683 3.69297 11.705L4.16585 9.75693C4.20893 9.57947 4.29978 9.4172 4.42854 9.28771L9.05645 4.63375M11.3799 6.9572L12.3455 5.98759C12.9839 5.34655 12.9839 4.31002 12.3455 3.66897C11.7033 3.02415 10.6594 3.02415 10.0172 3.66897L9.06126 4.62892L9.05645 4.63375",stroke:"currentColor",strokeWidth:"0.9",strokeLinecap:"round",strokeLinejoin:"round"})}),ii=({size:t=24})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M13.5 4C14.7426 4 15.75 5.00736 15.75 6.25V7H18.5C18.9142 7 19.25 7.33579 19.25 7.75C19.25 8.16421 18.9142 8.5 18.5 8.5H17.9678L17.6328 16.2217C17.61 16.7475 17.5912 17.1861 17.5469 17.543C17.5015 17.9087 17.4225 18.2506 17.2461 18.5723C16.9747 19.0671 16.5579 19.4671 16.0518 19.7168C15.7227 19.8791 15.3772 19.9422 15.0098 19.9717C14.6514 20.0004 14.2126 20 13.6865 20H10.3135C9.78735 20 9.34856 20.0004 8.99023 19.9717C8.62278 19.9422 8.27729 19.8791 7.94824 19.7168C7.44205 19.4671 7.02532 19.0671 6.75391 18.5723C6.57751 18.2506 6.49853 17.9087 6.45312 17.543C6.40883 17.1861 6.39005 16.7475 6.36719 16.2217L6.03223 8.5H5.5C5.08579 8.5 4.75 8.16421 4.75 7.75C4.75 7.33579 5.08579 7 5.5 7H8.25V6.25C8.25 5.00736 9.25736 4 10.5 4H13.5ZM7.86621 16.1562C7.89013 16.7063 7.90624 17.0751 7.94141 17.3584C7.97545 17.6326 8.02151 17.7644 8.06934 17.8516C8.19271 18.0763 8.38239 18.2577 8.6123 18.3711C8.70153 18.4151 8.83504 18.4545 9.11035 18.4766C9.39482 18.4994 9.76335 18.5 10.3135 18.5H13.6865C14.2367 18.5 14.6052 18.4994 14.8896 18.4766C15.165 18.4545 15.2985 18.4151 15.3877 18.3711C15.6176 18.2577 15.8073 18.0763 15.9307 17.8516C15.9785 17.7644 16.0245 17.6326 16.0586 17.3584C16.0938 17.0751 16.1099 16.7063 16.1338 16.1562L16.4668 8.5H7.5332L7.86621 16.1562ZM9.97656 10.75C10.3906 10.7371 10.7371 11.0626 10.75 11.4766L10.875 15.4766C10.8879 15.8906 10.5624 16.2371 10.1484 16.25C9.73443 16.2629 9.38794 15.9374 9.375 15.5234L9.25 11.5234C9.23706 11.1094 9.56255 10.7629 9.97656 10.75ZM14.0244 10.75C14.4383 10.7635 14.7635 11.1105 14.75 11.5244L14.6201 15.5244C14.6066 15.9384 14.2596 16.2634 13.8457 16.25C13.4317 16.2365 13.1067 15.8896 13.1201 15.4756L13.251 11.4756C13.2645 11.0617 13.6105 10.7366 14.0244 10.75ZM10.5 5.5C10.0858 5.5 9.75 5.83579 9.75 6.25V7H14.25V6.25C14.25 5.83579 13.9142 5.5 13.5 5.5H10.5Z",fill:"currentColor"})}),li=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M8.5 3.5L4 8L8.5 12.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),Mc=({size:t=16})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M8.5 11.5L12 8L8.5 4.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),$c=({size:t=20,color:n="#4C74FF"})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 28 28",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("style",{children:`
      @keyframes bunnyEnterEar {
        0% { opacity: 0; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes bunnyEnterFace {
        0% { opacity: 0; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes bunnyEnterEye {
        0% { opacity: 0; transform: scale(0.5); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes leftEyeLook {
        0%, 8% { transform: translate(0, 0); }
        10%, 18% { transform: translate(1.5px, 0); }
        20%, 22% { transform: translate(1.5px, 0) scaleY(0.1); }
        24%, 32% { transform: translate(1.5px, 0); }
        35%, 48% { transform: translate(-0.8px, -0.6px); }
        52%, 54% { transform: translate(0, 0) scaleY(0.1); }
        56%, 68% { transform: translate(0, 0); }
        72%, 82% { transform: translate(-0.5px, 0.5px); }
        85%, 100% { transform: translate(0, 0); }
      }
      @keyframes rightEyeLook {
        0%, 8% { transform: translate(0, 0); }
        10%, 18% { transform: translate(0.8px, 0); }
        20%, 22% { transform: translate(0.8px, 0) scaleY(0.1); }
        24%, 32% { transform: translate(0.8px, 0); }
        35%, 48% { transform: translate(-1.5px, -0.6px); }
        52%, 54% { transform: translate(0, 0) scaleY(0.1); }
        56%, 68% { transform: translate(0, 0); }
        72%, 82% { transform: translate(-1.2px, 0.5px); }
        85%, 100% { transform: translate(0, 0); }
      }
      @keyframes leftEarTwitch {
        0%, 9% { transform: rotate(0deg); }
        12% { transform: rotate(-8deg); }
        16%, 34% { transform: rotate(0deg); }
        38% { transform: rotate(-12deg); }
        42% { transform: rotate(-6deg); }
        48%, 100% { transform: rotate(0deg); }
      }
      @keyframes rightEarTwitch {
        0%, 9% { transform: rotate(0deg); }
        12% { transform: rotate(6deg); }
        16%, 34% { transform: rotate(0deg); }
        38% { transform: rotate(10deg); }
        42% { transform: rotate(4deg); }
        48%, 71% { transform: rotate(0deg); }
        74% { transform: rotate(8deg); }
        78%, 100% { transform: rotate(0deg); }
      }
      .bunny-eye-left {
        opacity: 0;
        animation: bunnyEnterEye 0.3s ease-out 0.35s forwards, leftEyeLook 5s ease-in-out 0.65s infinite;
        transform-origin: center;
        transform-box: fill-box;
      }
      .bunny-eye-right {
        opacity: 0;
        animation: bunnyEnterEye 0.3s ease-out 0.4s forwards, rightEyeLook 5s ease-in-out 0.7s infinite;
        transform-origin: center;
        transform-box: fill-box;
      }
      .bunny-ear-left {
        opacity: 0;
        animation: bunnyEnterEar 0.3s ease-out 0.1s forwards, leftEarTwitch 5s ease-in-out 0.4s infinite;
        transform-origin: bottom center;
        transform-box: fill-box;
      }
      .bunny-ear-right {
        opacity: 0;
        animation: bunnyEnterEar 0.3s ease-out 0.15s forwards, rightEarTwitch 5s ease-in-out 0.45s infinite;
        transform-origin: bottom center;
        transform-box: fill-box;
      }
      .bunny-face {
        opacity: 0;
        animation: bunnyEnterFace 0.3s ease-out 0.25s forwards;
        transform-origin: center;
        transform-box: fill-box;
      }
      svg:hover .bunny-eye-left,
      svg:hover .bunny-eye-right {
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .bunny-happy-face {
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      svg:hover .bunny-happy-face {
        opacity: 1;
      }
    `}),e.jsx("rect",{width:"28",height:"28",fill:"transparent"}),e.jsx("path",{className:"bunny-ear-left",d:"M3.738 10.2164L7.224 2.007H9.167L5.676 10.2164H3.738ZM10.791 6.42705C10.791 5.90346 10.726 5.42764 10.596 4.99959C10.47 4.57155 10.292 4.16643 10.063 3.78425C9.833 3.39825 9.56 3.01797 9.243 2.64343C8.926 2.26507 8.767 2.07589 8.767 2.07589L10.24 0.957996C10.24 0.957996 10.433 1.17203 10.819 1.60007C11.209 2.0243 11.559 2.49056 11.869 2.99886C12.178 3.50717 12.413 4.04222 12.574 4.60403C12.734 5.16584 12.814 5.77352 12.814 6.42705C12.814 7.10734 12.73 7.7303 12.562 8.29593C12.394 8.85774 12.153 9.3966 11.84 9.9126C11.526 10.4247 11.181 10.8833 10.802 11.2884C10.428 11.6974 10.24 11.9018 10.24 11.9018L8.767 10.7839C8.767 10.7839 8.924 10.5948 9.237 10.2164C9.554 9.8419 9.83 9.4597 10.063 9.06985C10.3 8.6762 10.479 8.26726 10.602 7.84304C10.728 7.41499 10.791 6.943 10.791 6.42705Z",fill:n}),e.jsx("path",{className:"bunny-ear-right",d:"M15.003 10.2164L18.489 2.007H20.432L16.941 10.2164H15.003ZM22.056 6.42705C22.056 5.90346 21.991 5.42764 21.861 4.99959C21.735 4.57155 21.557 4.16643 21.328 3.78425C21.098 3.39825 20.825 3.01797 20.508 2.64343C20.191 2.26507 20.032 2.07589 20.032 2.07589L21.505 0.957996C21.505 0.957996 21.698 1.17203 22.084 1.60007C22.474 2.0243 22.824 2.49056 23.133 2.99886C23.443 3.50717 23.678 4.04222 23.839 4.60403C23.999 5.16584 24.079 5.77352 24.079 6.42705C24.079 7.10734 23.995 7.7303 23.827 8.29593C23.659 8.85774 23.418 9.3966 23.105 9.9126C22.791 10.4247 22.445 10.8833 22.067 11.2884C21.693 11.6974 21.505 11.9018 21.505 11.9018L20.032 10.7839C20.032 10.7839 20.189 10.5948 20.502 10.2164C20.819 9.8419 21.094 9.4597 21.328 9.06985C21.565 8.6762 21.744 8.26726 21.866 7.84304C21.993 7.41499 22.056 6.943 22.056 6.42705Z",fill:n}),e.jsx("path",{className:"bunny-face",d:"M2.03 20.4328C2.03 20.9564 2.093 21.4322 2.219 21.8602C2.345 22.2883 2.523 22.6953 2.752 23.0813C2.981 23.4635 3.254 23.8419 3.572 24.2164C3.889 24.5948 4.047 24.7839 4.047 24.7839L2.574 25.9018C2.574 25.9018 2.379 25.6878 1.989 25.2598C1.603 24.8355 1.256 24.3693 0.946 23.861C0.636 23.3527 0.401 22.8176 0.241 22.2558C0.08 21.694 0 21.0863 0 20.4328C0 19.7525 0.084 19.1314 0.252 18.5696C0.421 18.004 0.661 17.4651 0.975 16.953C1.288 16.4371 1.632 15.9765 2.007 15.5714C2.385 15.1625 2.574 14.958 2.574 14.958L4.047 16.0759C4.047 16.0759 3.889 16.2651 3.572 16.6434C3.258 17.018 2.983 17.4021 2.746 17.7957C2.513 18.1855 2.335 18.5945 2.213 19.0225C2.091 19.4467 2.03 19.9168 2.03 20.4328ZM23.687 20.4271C23.687 19.9035 23.622 19.4276 23.492 18.9996C23.366 18.5715 23.188 18.1664 22.959 17.7843C22.729 17.3982 22.456 17.018 22.139 16.6434C21.822 16.2651 21.663 16.0759 21.663 16.0759L23.136 14.958C23.136 14.958 23.329 15.172 23.715 15.6001C24.105 16.0243 24.455 16.4906 24.765 16.9989C25.074 17.5072 25.309 18.0422 25.47 18.604C25.63 19.1658 25.71 19.7735 25.71 20.4271C25.71 21.1073 25.626 21.7303 25.458 22.2959C25.29 22.8577 25.049 23.3966 24.736 23.9126C24.422 24.4247 24.077 24.8833 23.698 25.2884C23.324 25.6974 23.136 25.9018 23.136 25.9018L21.663 24.7839C21.663 24.7839 21.82 24.5948 22.133 24.2164C22.45 23.8419 22.726 23.4597 22.959 23.0698C23.196 22.6762 23.375 22.2673 23.498 21.843C23.624 21.415 23.687 20.943 23.687 20.4271Z",fill:n}),e.jsx("circle",{className:"bunny-eye-left",cx:"8.277",cy:"20.466",r:"1.8",fill:n}),e.jsx("circle",{className:"bunny-eye-right",cx:"19.878",cy:"20.466",r:"1.8",fill:n}),e.jsx("text",{className:"bunny-happy-face",x:"14",y:"26",textAnchor:"middle",fontSize:"12",fontWeight:"bold",fill:n,fontFamily:"system-ui, -apple-system, sans-serif",children:"˃ ᵕ ˂"})]}),ai=({size:t=24})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("line",{x1:"3",y1:"9",x2:"21",y2:"9",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("line",{x1:"9",y1:"9",x2:"9",y2:"21",stroke:"currentColor",strokeWidth:"1.5"})]}),tr=["data-feedback-toolbar","data-annotation-popup","data-annotation-marker"],To=tr.flatMap(t=>[`:not([${t}])`,`:not([${t}] *)`]).join(""),Qo="feedback-freeze-styles",Do="__agentation_freeze";function ci(){if(typeof window>"u")return{frozen:!1,installed:!0,origSetTimeout:setTimeout,origSetInterval:setInterval,origRAF:n=>0,pausedAnimations:[],frozenTimeoutQueue:[],frozenRAFQueue:[]};const t=window;return t[Do]||(t[Do]={frozen:!1,installed:!1,origSetTimeout:null,origSetInterval:null,origRAF:null,pausedAnimations:[],frozenTimeoutQueue:[],frozenRAFQueue:[]}),t[Do]}var je=ci();typeof window<"u"&&!je.installed&&(je.origSetTimeout=window.setTimeout.bind(window),je.origSetInterval=window.setInterval.bind(window),je.origRAF=window.requestAnimationFrame.bind(window),window.setTimeout=(t,n,...o)=>typeof t=="string"?je.origSetTimeout(t,n):je.origSetTimeout((...s)=>{je.frozen?je.frozenTimeoutQueue.push(()=>t(...s)):t(...s)},n,...o),window.setInterval=(t,n,...o)=>typeof t=="string"?je.origSetInterval(t,n):je.origSetInterval((...s)=>{je.frozen||t(...s)},n,...o),window.requestAnimationFrame=t=>je.origRAF(n=>{je.frozen?je.frozenRAFQueue.push(t):t(n)}),je.installed=!0);var ne=je.origSetTimeout,di=je.origSetInterval,kn=je.origRAF;function _i(t){return t?tr.some(n=>!!t.closest?.(`[${n}]`)):!1}function ui(){if(typeof document>"u"||je.frozen)return;je.frozen=!0,je.frozenTimeoutQueue=[],je.frozenRAFQueue=[];let t=document.getElementById(Qo);t||(t=document.createElement("style"),t.id=Qo),t.textContent=`
    *${To},
    *${To}::before,
    *${To}::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
  `,document.head.appendChild(t),je.pausedAnimations=[];try{document.getAnimations().forEach(n=>{if(n.playState!=="running")return;const o=n.effect?.target;_i(o)||(n.pause(),je.pausedAnimations.push(n))})}catch{}document.querySelectorAll("video").forEach(n=>{n.paused||(n.dataset.wasPaused="false",n.pause())})}function $s(){if(typeof document>"u"||!je.frozen)return;je.frozen=!1;const t=je.frozenTimeoutQueue;je.frozenTimeoutQueue=[];for(const o of t)je.origSetTimeout(()=>{if(je.frozen){je.frozenTimeoutQueue.push(o);return}try{o()}catch(s){console.warn("[agentation] Error replaying queued timeout:",s)}},0);const n=je.frozenRAFQueue;je.frozenRAFQueue=[];for(const o of n)je.origRAF(s=>{if(je.frozen){je.frozenRAFQueue.push(o);return}o(s)});for(const o of je.pausedAnimations)try{o.play()}catch(s){console.warn("[agentation] Error resuming animation:",s)}je.pausedAnimations=[],document.getElementById(Qo)?.remove(),document.querySelectorAll("video").forEach(o=>{o.dataset.wasPaused==="false"&&(o.play().catch(()=>{}),delete o.dataset.wasPaused)})}function Po(t){if(!t)return;const n=o=>o.stopImmediatePropagation();document.addEventListener("focusin",n,!0),document.addEventListener("focusout",n,!0);try{t.focus()}finally{document.removeEventListener("focusin",n,!0),document.removeEventListener("focusout",n,!0)}}var po=c.forwardRef(function({element:n,timestamp:o,selectedText:s,placeholder:r="What should change?",initialValue:i="",submitLabel:_="Add",onSubmit:y,onCancel:g,onDelete:N,style:f,accentColor:R="#3c82f7",isExiting:b=!1,lightMode:z=!1,computedStyles:v},T){const[w,I]=c.useState(i),[X,ae]=c.useState(!1),[re,Ye]=c.useState("initial"),[Xe,Q]=c.useState(!1),[Ve,We]=c.useState(!1),Me=c.useRef(null),ye=c.useRef(null),ze=c.useRef(null),Ue=c.useRef(null);c.useEffect(()=>{b&&re!=="exit"&&Ye("exit")},[b,re]),c.useEffect(()=>{ne(()=>{Ye("enter")},0);const ce=ne(()=>{Ye("entered")},200),Re=ne(()=>{const Je=Me.current;Je&&(Po(Je),Je.selectionStart=Je.selectionEnd=Je.value.length,Je.scrollTop=Je.scrollHeight)},50);return()=>{clearTimeout(ce),clearTimeout(Re),ze.current&&clearTimeout(ze.current),Ue.current&&clearTimeout(Ue.current)}},[]);const xe=c.useCallback(()=>{Ue.current&&clearTimeout(Ue.current),ae(!0),Ue.current=ne(()=>{ae(!1),Po(Me.current)},250)},[]);c.useImperativeHandle(T,()=>({shake:xe}),[xe]);const Se=c.useCallback(()=>{Ye("exit"),ze.current=ne(()=>{g()},150)},[g]),q=c.useCallback(()=>{w.trim()&&y(w.trim())},[w,y]),rt=c.useCallback(ce=>{ce.stopPropagation(),!ce.nativeEvent.isComposing&&(ce.key==="Enter"&&!ce.shiftKey&&(ce.preventDefault(),q()),ce.key==="Escape"&&Se())},[q,Se]),P=[qe.popup,z?qe.light:"",re==="enter"?qe.enter:"",re==="entered"?qe.entered:"",re==="exit"?qe.exit:"",X?qe.shake:""].filter(Boolean).join(" ");return e.jsxs("div",{ref:ye,className:P,"data-annotation-popup":!0,style:f,onClick:ce=>ce.stopPropagation(),children:[e.jsxs("div",{className:qe.header,children:[v&&Object.keys(v).length>0?e.jsxs("button",{className:qe.headerToggle,onClick:()=>{const ce=Ve;We(!Ve),ce&&ne(()=>Po(Me.current),0)},type:"button",children:[e.jsx("svg",{className:`${qe.chevron} ${Ve?qe.expanded:""}`,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M5.5 10.25L9 7.25L5.75 4",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{className:qe.element,children:n})]}):e.jsx("span",{className:qe.element,children:n}),o&&e.jsx("span",{className:qe.timestamp,children:o})]}),v&&Object.keys(v).length>0&&e.jsx("div",{className:`${qe.stylesWrapper} ${Ve?qe.expanded:""}`,children:e.jsx("div",{className:qe.stylesInner,children:e.jsx("div",{className:qe.stylesBlock,children:Object.entries(v).map(([ce,Re])=>e.jsxs("div",{className:qe.styleLine,children:[e.jsx("span",{className:qe.styleProperty,children:ce.replace(/([A-Z])/g,"-$1").toLowerCase()}),": ",e.jsx("span",{className:qe.styleValue,children:Re}),";"]},ce))})})}),s&&e.jsxs("div",{className:qe.quote,children:["“",s.slice(0,80),s.length>80?"...":"","”"]}),e.jsx("textarea",{ref:Me,className:qe.textarea,style:{borderColor:Xe?R:void 0},placeholder:r,value:w,onChange:ce=>I(ce.target.value),onFocus:()=>Q(!0),onBlur:()=>Q(!1),rows:2,onKeyDown:rt}),e.jsxs("div",{className:qe.actions,children:[N&&e.jsx("div",{className:qe.deleteWrapper,children:e.jsx("button",{className:qe.deleteButton,onClick:N,type:"button",children:e.jsx(ii,{size:22})})}),e.jsx("button",{className:qe.cancel,onClick:Se,children:"Cancel"}),e.jsx("button",{className:qe.submit,style:{backgroundColor:R,opacity:w.trim()?1:.4},onClick:q,disabled:!w.trim(),children:_})]})]})}),hi=({content:t,children:n,...o})=>{const[s,r]=c.useState(!1),[i,_]=c.useState(!1),[y,g]=c.useState({top:0,right:0}),N=c.useRef(null),f=c.useRef(null),R=c.useRef(null),b=()=>{if(N.current){const T=N.current.getBoundingClientRect();g({top:T.top+T.height/2,right:window.innerWidth-T.left+8})}},z=()=>{_(!0),R.current&&(clearTimeout(R.current),R.current=null),b(),f.current=ne(()=>{r(!0)},500)},v=()=>{f.current&&(clearTimeout(f.current),f.current=null),r(!1),R.current=ne(()=>{_(!1)},150)};return c.useEffect(()=>()=>{f.current&&clearTimeout(f.current),R.current&&clearTimeout(R.current)},[]),e.jsxs(e.Fragment,{children:[e.jsx("span",{ref:N,onMouseEnter:z,onMouseLeave:v,...o,children:n}),i&&Js.createPortal(e.jsx("div",{"data-feedback-toolbar":!0,style:{position:"fixed",top:y.top,right:y.right,transform:"translateY(-50%)",padding:"6px 10px",background:"#383838",color:"rgba(255, 255, 255, 0.7)",fontSize:"11px",fontWeight:400,lineHeight:"14px",borderRadius:"10px",width:"180px",textAlign:"left",zIndex:100020,pointerEvents:"none",boxShadow:"0px 1px 8px rgba(0, 0, 0, 0.28)",opacity:s?1:0,transition:"opacity 0.15s ease"},children:t}),document.body)]})},mi=`.styles-module__tooltip___mcXL2 {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: help;
}

.styles-module__tooltipIcon___Nq2nD {
  transform: translateY(0.5px);
  color: #fff;
  opacity: 0.2;
  transition: opacity 0.15s ease;
  will-change: transform;
}
.styles-module__tooltip___mcXL2:hover .styles-module__tooltipIcon___Nq2nD {
  opacity: 0.5;
}
[data-agentation-theme=light] .styles-module__tooltipIcon___Nq2nD {
  color: #000;
}`,gi={tooltip:"styles-module__tooltip___mcXL2",tooltipIcon:"styles-module__tooltipIcon___Nq2nD"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-help-tooltip-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-help-tooltip-styles",document.head.appendChild(t)),t.textContent=mi}var Is=gi,dn=({content:t})=>e.jsx(hi,{className:Is.tooltip,content:t,children:e.jsx(qr,{className:Is.tooltipIcon})}),O={navigation:{width:800,height:56},hero:{width:800,height:320},header:{width:800,height:80},section:{width:800,height:400},sidebar:{width:240,height:400},footer:{width:800,height:160},modal:{width:480,height:300},card:{width:280,height:240},text:{width:400,height:120},image:{width:320,height:200},video:{width:480,height:270},table:{width:560,height:220},grid:{width:600,height:300},list:{width:300,height:180},chart:{width:400,height:240},button:{width:140,height:40},input:{width:280,height:56},form:{width:360,height:320},tabs:{width:480,height:240},dropdown:{width:200,height:200},toggle:{width:44,height:24},search:{width:320,height:44},avatar:{width:48,height:48},badge:{width:80,height:28},breadcrumb:{width:300,height:24},pagination:{width:300,height:36},progress:{width:240,height:8},divider:{width:600,height:1},accordion:{width:400,height:200},carousel:{width:600,height:300},toast:{width:320,height:64},tooltip:{width:180,height:40},pricing:{width:300,height:360},testimonial:{width:360,height:200},cta:{width:600,height:160},alert:{width:400,height:56},banner:{width:800,height:48},stat:{width:200,height:120},stepper:{width:480,height:48},tag:{width:72,height:28},rating:{width:160,height:28},map:{width:480,height:300},timeline:{width:360,height:320},fileUpload:{width:360,height:180},codeBlock:{width:480,height:200},calendar:{width:300,height:300},notification:{width:360,height:72},productCard:{width:280,height:360},profile:{width:280,height:200},drawer:{width:320,height:400},popover:{width:240,height:160},logo:{width:120,height:40},faq:{width:560,height:320},gallery:{width:560,height:360},checkbox:{width:20,height:20},radio:{width:20,height:20},slider:{width:240,height:32},datePicker:{width:300,height:320},skeleton:{width:320,height:120},chip:{width:96,height:32},icon:{width:24,height:24},spinner:{width:32,height:32},feature:{width:360,height:200},team:{width:560,height:280},login:{width:360,height:360},contact:{width:400,height:320}},nr=[{section:"Layout",items:[{type:"navigation",label:"Navigation",...O.navigation},{type:"header",label:"Header",...O.header},{type:"hero",label:"Hero",...O.hero},{type:"section",label:"Section",...O.section},{type:"sidebar",label:"Sidebar",...O.sidebar},{type:"footer",label:"Footer",...O.footer},{type:"modal",label:"Modal",...O.modal},{type:"banner",label:"Banner",...O.banner},{type:"drawer",label:"Drawer",...O.drawer},{type:"popover",label:"Popover",...O.popover},{type:"divider",label:"Divider",...O.divider}]},{section:"Content",items:[{type:"card",label:"Card",...O.card},{type:"text",label:"Text",...O.text},{type:"image",label:"Image",...O.image},{type:"video",label:"Video",...O.video},{type:"table",label:"Table",...O.table},{type:"grid",label:"Grid",...O.grid},{type:"list",label:"List",...O.list},{type:"chart",label:"Chart",...O.chart},{type:"codeBlock",label:"Code Block",...O.codeBlock},{type:"map",label:"Map",...O.map},{type:"timeline",label:"Timeline",...O.timeline},{type:"calendar",label:"Calendar",...O.calendar},{type:"accordion",label:"Accordion",...O.accordion},{type:"carousel",label:"Carousel",...O.carousel},{type:"logo",label:"Logo",...O.logo},{type:"faq",label:"FAQ",...O.faq},{type:"gallery",label:"Gallery",...O.gallery}]},{section:"Controls",items:[{type:"button",label:"Button",...O.button},{type:"input",label:"Input",...O.input},{type:"search",label:"Search",...O.search},{type:"form",label:"Form",...O.form},{type:"tabs",label:"Tabs",...O.tabs},{type:"dropdown",label:"Dropdown",...O.dropdown},{type:"toggle",label:"Toggle",...O.toggle},{type:"stepper",label:"Stepper",...O.stepper},{type:"rating",label:"Rating",...O.rating},{type:"fileUpload",label:"File Upload",...O.fileUpload},{type:"checkbox",label:"Checkbox",...O.checkbox},{type:"radio",label:"Radio",...O.radio},{type:"slider",label:"Slider",...O.slider},{type:"datePicker",label:"Date Picker",...O.datePicker}]},{section:"Elements",items:[{type:"avatar",label:"Avatar",...O.avatar},{type:"badge",label:"Badge",...O.badge},{type:"tag",label:"Tag",...O.tag},{type:"breadcrumb",label:"Breadcrumb",...O.breadcrumb},{type:"pagination",label:"Pagination",...O.pagination},{type:"progress",label:"Progress",...O.progress},{type:"alert",label:"Alert",...O.alert},{type:"toast",label:"Toast",...O.toast},{type:"notification",label:"Notification",...O.notification},{type:"tooltip",label:"Tooltip",...O.tooltip},{type:"stat",label:"Stat",...O.stat},{type:"skeleton",label:"Skeleton",...O.skeleton},{type:"chip",label:"Chip",...O.chip},{type:"icon",label:"Icon",...O.icon},{type:"spinner",label:"Spinner",...O.spinner}]},{section:"Blocks",items:[{type:"pricing",label:"Pricing",...O.pricing},{type:"testimonial",label:"Testimonial",...O.testimonial},{type:"cta",label:"CTA",...O.cta},{type:"productCard",label:"Product Card",...O.productCard},{type:"profile",label:"Profile",...O.profile},{type:"feature",label:"Feature",...O.feature},{type:"team",label:"Team",...O.team},{type:"login",label:"Login",...O.login},{type:"contact",label:"Contact",...O.contact}]}],Nt={};for(const t of nr)for(const n of t.items)Nt[n.type]=n;function $({w:t,h:n=3,strong:o}){return e.jsx("div",{style:{width:typeof t=="number"?`${t}px`:t,height:n,borderRadius:2,background:o?"var(--agd-bar-strong)":"var(--agd-bar)",flexShrink:0}})}function He({w:t,h:n,radius:o=3,style:s}){return e.jsx("div",{style:{width:typeof t=="number"?`${t}px`:t,height:typeof n=="number"?`${n}px`:n,borderRadius:o,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",flexShrink:0,...s}})}function mt({size:t}){return e.jsx("div",{style:{width:t,height:t,borderRadius:"50%",border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",flexShrink:0}})}function pi({width:t,height:n}){const o=Math.max(8,n*.2);return e.jsxs("div",{style:{display:"flex",alignItems:"center",height:"100%",padding:`0 ${o}px`,gap:t*.02},children:[e.jsx(He,{w:Math.max(20,n*.5),h:Math.max(12,n*.4),radius:2}),e.jsxs("div",{style:{flex:1,display:"flex",gap:t*.03,marginLeft:t*.04},children:[e.jsx($,{w:t*.06}),e.jsx($,{w:t*.07}),e.jsx($,{w:t*.05}),e.jsx($,{w:t*.06})]}),e.jsx(He,{w:t*.1,h:Math.min(28,n*.5),radius:4})]})}function fi({width:t,height:n,text:o}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:n*.05},children:[o?e.jsx("span",{style:{fontSize:Math.min(20,n*.08),fontWeight:600,color:"var(--agd-text-3)",textAlign:"center",maxWidth:"80%"},children:o}):e.jsx($,{w:t*.5,h:Math.max(6,n*.04),strong:!0}),e.jsx($,{w:t*.6}),e.jsx($,{w:t*.4}),e.jsx(He,{w:Math.min(140,t*.2),h:Math.min(36,n*.12),radius:6,style:{marginTop:n*.06}})]})}function yi({width:t,height:n}){const o=Math.max(3,Math.floor(n/36));return e.jsxs("div",{style:{padding:t*.08,display:"flex",flexDirection:"column",gap:n*.03},children:[e.jsx($,{w:t*.6,h:4,strong:!0}),Array.from({length:o},(s,r)=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(He,{w:10,h:10,radius:2}),e.jsx($,{w:t*(.4+r*17%30/100)})]},r))]})}function xi({width:t,height:n}){const o=Math.max(2,Math.min(4,Math.floor(t/160)));return e.jsx("div",{style:{display:"flex",padding:`${n*.12}px ${t*.03}px`,gap:t*.05},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[e.jsx($,{w:"60%",h:3,strong:!0}),e.jsx($,{w:"80%",h:2}),e.jsx($,{w:"70%",h:2}),e.jsx($,{w:"60%",h:2})]},r))})}function bi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{style:{padding:"10px 12px",borderBottom:"1px solid var(--agd-stroke)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx($,{w:t*.3,h:4,strong:!0}),e.jsx("div",{style:{width:14,height:14,border:"1px solid var(--agd-stroke)",borderRadius:3}})]}),e.jsxs("div",{style:{flex:1,padding:12,display:"flex",flexDirection:"column",gap:6},children:[e.jsx($,{w:"90%"}),e.jsx($,{w:"70%"}),e.jsx($,{w:"80%"})]}),e.jsxs("div",{style:{padding:"10px 12px",borderTop:"1px solid var(--agd-stroke)",display:"flex",justifyContent:"flex-end",gap:8},children:[e.jsx(He,{w:70,h:26,radius:4}),e.jsx(He,{w:70,h:26,radius:4,style:{background:"var(--agd-bar)"}})]})]})}function wi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx("div",{style:{height:"40%",background:"var(--agd-fill)",borderBottom:"1px dashed var(--agd-stroke)"}}),e.jsxs("div",{style:{flex:1,padding:10,display:"flex",flexDirection:"column",gap:5},children:[e.jsx($,{w:"70%",h:4,strong:!0}),e.jsx($,{w:"95%",h:2}),e.jsx($,{w:"85%",h:2}),e.jsx($,{w:"50%",h:2})]})]})}function vi({width:t,height:n,text:o}){if(o)return e.jsx("div",{style:{padding:4,fontSize:Math.min(14,n*.3),lineHeight:1.5,color:"var(--agd-text-3)",wordBreak:"break-word",overflow:"hidden"},children:o});const s=Math.max(2,Math.floor(n/18));return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:6,padding:4},children:[e.jsx($,{w:t*.6,h:5,strong:!0}),Array.from({length:s},(r,i)=>e.jsx($,{w:`${70+i*13%25}%`,h:2},i))]})}function ki({width:t,height:n}){return e.jsx("div",{style:{height:"100%",position:"relative"},children:e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,preserveAspectRatio:"none",fill:"none",children:[e.jsx("line",{x1:"0",y1:"0",x2:t,y2:n,stroke:"var(--agd-stroke)",strokeWidth:"1"}),e.jsx("line",{x1:t,y1:"0",x2:"0",y2:n,stroke:"var(--agd-stroke)",strokeWidth:"1"}),e.jsx("circle",{cx:t*.3,cy:n*.3,r:Math.min(t,n)*.08,fill:"var(--agd-fill)",stroke:"var(--agd-stroke)",strokeWidth:"0.8"})]})})}function ji({width:t,height:n}){const o=Math.max(2,Math.min(5,Math.floor(t/100))),s=Math.max(2,Math.min(6,Math.floor(n/32)));return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--agd-stroke)",padding:"6px 0"},children:Array.from({length:o},(r,i)=>e.jsx("div",{style:{flex:1,padding:"0 8px"},children:e.jsx($,{w:"70%",h:3,strong:!0})},i))}),Array.from({length:s},(r,i)=>e.jsx("div",{style:{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.03)",padding:"6px 0"},children:Array.from({length:o},(_,y)=>e.jsx("div",{style:{flex:1,padding:"0 8px"},children:e.jsx($,{w:`${50+(i*7+y*13)%40}%`,h:2})},y))},i))]})}function Ci({width:t,height:n}){const o=Math.max(2,Math.floor(n/28));return e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:4,padding:4},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0"},children:[e.jsx(mt,{size:8}),e.jsx($,{w:`${55+r*17%35}%`,h:2})]},r))})}function Si({width:t,height:n,text:o}){return e.jsx("div",{style:{height:"100%",borderRadius:Math.min(8,n/3),border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:o?e.jsx("span",{style:{fontSize:Math.min(13,n*.4),fontWeight:500,color:"var(--agd-text-3)",letterSpacing:"-0.01em"},children:o}):e.jsx($,{w:Math.max(20,t*.5),h:3,strong:!0})})}function Mi({width:t,height:n}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4,height:"100%",justifyContent:"center"},children:[e.jsx($,{w:Math.min(80,t*.3),h:2}),e.jsx("div",{style:{height:Math.min(36,n*.6),borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",paddingLeft:8},children:e.jsx($,{w:"40%",h:2})})]})}function $i({width:t,height:n}){const o=Math.max(2,Math.min(5,Math.floor(n/56)));return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:n*.04,padding:8},children:[Array.from({length:o},(s,r)=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsx($,{w:60+r*17%30,h:2}),e.jsx(He,{w:"100%",h:28,radius:4})]},r)),e.jsx(He,{w:Math.min(120,t*.35),h:30,radius:6,style:{marginTop:8,alignSelf:"flex-end",background:"var(--agd-bar)"}})]})}function Ii({width:t,height:n}){const o=Math.max(2,Math.min(4,Math.floor(t/120)));return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx("div",{style:{display:"flex",gap:2,borderBottom:"1px solid var(--agd-stroke)"},children:Array.from({length:o},(s,r)=>e.jsx("div",{style:{padding:"8px 12px",borderBottom:r===0?"2px solid var(--agd-bar-strong)":"none"},children:e.jsx($,{w:60,h:3,strong:r===0})},r))}),e.jsxs("div",{style:{flex:1,padding:12,display:"flex",flexDirection:"column",gap:6},children:[e.jsx($,{w:"80%",h:2}),e.jsx($,{w:"65%",h:2}),e.jsx($,{w:"75%",h:2})]})]})}function Li({width:t,height:n}){const o=Math.min(t,n)/2;return e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",children:[e.jsx("circle",{cx:t/2,cy:n/2,r:o-1,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"1.5",strokeDasharray:"3 2"}),e.jsx("circle",{cx:t/2,cy:n*.38,r:o*.28,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"0.8"}),e.jsx("path",{d:`M${t/2-o*.55} ${n*.78} C${t/2-o*.55} ${n*.55} ${t/2+o*.55} ${n*.55} ${t/2+o*.55} ${n*.78}`,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"0.8"})]})}function Ei({width:t,height:n}){return e.jsx("div",{style:{height:"100%",borderRadius:n/2,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx($,{w:Math.max(16,t*.5),h:2,strong:!0})})}function Ri({width:t,height:n}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:n*.08},children:[e.jsx($,{w:t*.5,h:Math.max(5,n*.06),strong:!0}),e.jsx($,{w:t*.35})]})}function Ni({width:t,height:n}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%",gap:n*.04,padding:t*.04},children:[e.jsx($,{w:t*.3,h:4,strong:!0}),e.jsx($,{w:t*.7}),e.jsx($,{w:t*.5}),e.jsxs("div",{style:{flex:1,display:"flex",gap:t*.03,marginTop:n*.06},children:[e.jsx(He,{w:"33%",h:"100%",radius:4}),e.jsx(He,{w:"33%",h:"100%",radius:4}),e.jsx(He,{w:"33%",h:"100%",radius:4})]})]})}function Bi({width:t,height:n}){const o=Math.max(2,Math.min(4,Math.floor(t/140))),s=Math.max(1,Math.min(3,Math.floor(n/120)));return e.jsx("div",{style:{display:"grid",gridTemplateColumns:`repeat(${o}, 1fr)`,gridTemplateRows:`repeat(${s}, 1fr)`,gap:6,height:"100%"},children:Array.from({length:o*s},(r,i)=>e.jsx(He,{w:"100%",h:"100%",radius:4},i))})}function Ti({width:t,height:n}){const o=Math.max(2,Math.floor((n-32)/28));return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx("div",{style:{padding:"6px 8px",borderBottom:"1px solid var(--agd-stroke)"},children:e.jsx($,{w:t*.5,h:3,strong:!0})}),e.jsx("div",{style:{flex:1,padding:4,display:"flex",flexDirection:"column",gap:2},children:Array.from({length:o},(s,r)=>e.jsx("div",{style:{padding:"4px 6px",borderRadius:3,background:r===0?"var(--agd-fill)":"transparent"},children:e.jsx($,{w:`${50+r*17%35}%`,h:2,strong:r===0})},r))})]})}function Di({width:t,height:n}){const o=Math.min(t,n)/2;return e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",children:[e.jsx("rect",{x:"1",y:"1",width:t-2,height:n-2,rx:o,stroke:"var(--agd-stroke)",strokeWidth:"1"}),e.jsx("circle",{cx:t-o,cy:n/2,r:o*.7,fill:"var(--agd-bar)"})]})}function Pi({width:t,height:n}){const o=Math.min(n/2,20);return e.jsxs("div",{style:{height:"100%",borderRadius:o,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:`0 ${o*.6}px`,gap:6},children:[e.jsx(mt,{size:Math.min(14,n*.4)}),e.jsx($,{w:"50%",h:2})]})}function Wi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[e.jsx(mt,{size:Math.min(20,n*.5)}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:"60%",h:3,strong:!0}),e.jsx($,{w:"80%",h:2})]}),e.jsx("div",{style:{width:14,height:14,border:"1px solid var(--agd-stroke)",borderRadius:3,flexShrink:0}})]})}function Ai({width:t,height:n}){return e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",children:[e.jsx("rect",{x:"0",y:"0",width:t,height:n,rx:n/2,stroke:"var(--agd-stroke)",strokeWidth:"0.8"}),e.jsx("rect",{x:"1",y:"1",width:t*.65,height:n-2,rx:(n-2)/2,fill:"var(--agd-bar)"})]})}function Oi({width:t,height:n}){const o=Math.max(3,Math.min(7,Math.floor(t/50))),s=t/(o*2);return e.jsx("div",{style:{height:"100%",display:"flex",alignItems:"flex-end",justifyContent:"space-around",padding:"0 4px",borderBottom:"1px solid var(--agd-stroke)"},children:Array.from({length:o},(r,i)=>{const _=30+(i*37+17)%55;return e.jsx(He,{w:s,h:`${_}%`,radius:2},i)})})}function zi({width:t,height:n}){const o=Math.min(t,n)*.12;return e.jsxs("div",{style:{height:"100%",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"},children:[e.jsx(He,{w:"100%",h:"100%",radius:4}),e.jsx("div",{style:{position:"absolute",width:o*2,height:o*2,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("div",{style:{width:0,height:0,borderLeft:`${o*.6}px solid var(--agd-bar-strong)`,borderTop:`${o*.4}px solid transparent`,borderBottom:`${o*.4}px solid transparent`,marginLeft:o*.15}})})]})}function Fi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsx("div",{style:{flex:1,width:"100%",borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx($,{w:"60%",h:2})}),e.jsx("div",{style:{width:8,height:8,background:"var(--agd-fill)",border:"1px dashed var(--agd-stroke)",borderTop:"none",borderLeft:"none",transform:"rotate(45deg)",marginTop:-5}})]})}function Hi({width:t,height:n}){const o=Math.max(2,Math.min(4,Math.floor(t/80)));return e.jsx("div",{style:{display:"flex",alignItems:"center",height:"100%",gap:4},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:4},children:[r>0&&e.jsx("span",{style:{color:"var(--agd-stroke)",fontSize:10},children:"/"}),e.jsx($,{w:40+r*13%20,h:2,strong:r===o-1})]},r))})}function Yi({width:t,height:n}){const o=Math.max(3,Math.min(5,Math.floor(t/40))),s=Math.min(28,n*.8);return e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",gap:4},children:Array.from({length:o},(r,i)=>e.jsx(He,{w:s,h:s,radius:4,style:i===1?{background:"var(--agd-bar)"}:void 0},i))})}function Xi({width:t}){return e.jsx("div",{style:{display:"flex",alignItems:"center",height:"100%"},children:e.jsx("div",{style:{width:"100%",height:1,background:"var(--agd-stroke)"}})})}function Ui({width:t,height:n}){const o=Math.max(2,Math.min(4,Math.floor(n/40)));return e.jsx("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{borderBottom:"1px solid var(--agd-stroke)",padding:"8px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flex:r===0?2:1},children:[e.jsx($,{w:`${40+r*17%25}%`,h:3,strong:!0}),e.jsx("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:r===0?"▼":"▶"})]},r))})}function Qi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:6},children:[e.jsxs("div",{style:{flex:1,display:"flex",gap:6,alignItems:"center"},children:[e.jsx("span",{style:{fontSize:12,color:"var(--agd-stroke)"},children:"‹"}),e.jsx(He,{w:"100%",h:"100%",radius:4}),e.jsx("span",{style:{fontSize:12,color:"var(--agd-stroke)"},children:"›"})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:4},children:[e.jsx(mt,{size:5}),e.jsx(mt,{size:5}),e.jsx(mt,{size:5})]})]})}function Vi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:10,gap:n*.04},children:[e.jsx($,{w:t*.4,h:3,strong:!0}),e.jsx($,{w:t*.3,h:6,strong:!0}),e.jsx("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4,width:"100%",padding:"8px 0"},children:Array.from({length:4},(o,s)=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:4},children:[e.jsx(mt,{size:5}),e.jsx($,{w:`${50+s*17%35}%`,h:2})]},s))}),e.jsx(He,{w:t*.7,h:Math.min(32,n*.1),radius:6,style:{background:"var(--agd-bar)"}})]})}function qi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",padding:10,gap:8},children:[e.jsx("span",{style:{fontSize:18,lineHeight:1,color:"var(--agd-stroke)",fontFamily:"serif"},children:"“"}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[e.jsx($,{w:"90%",h:2}),e.jsx($,{w:"75%",h:2}),e.jsx($,{w:"60%",h:2})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(mt,{size:20}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:2},children:[e.jsx($,{w:60,h:3,strong:!0}),e.jsx($,{w:40,h:2})]})]})]})}function Ki({width:t,height:n}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:n*.08},children:[e.jsx($,{w:t*.5,h:Math.max(4,n*.05),strong:!0}),e.jsx($,{w:t*.35}),e.jsx(He,{w:Math.min(140,t*.25),h:Math.min(32,n*.15),radius:6,style:{marginTop:n*.04,background:"var(--agd-bar)"}})]})}function Gi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[e.jsx("div",{style:{width:16,height:16,borderRadius:"50%",border:"1.5px solid var(--agd-bar-strong)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx("div",{style:{width:2,height:6,background:"var(--agd-bar-strong)",borderRadius:1}})}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:"40%",h:3,strong:!0}),e.jsx($,{w:"70%",h:2})]})]})}function Zi({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"0 12px"},children:[e.jsx($,{w:t*.4,h:3,strong:!0}),e.jsx(He,{w:60,h:Math.min(24,n*.6),radius:4})]})}function Ji({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:n*.06},children:[e.jsx($,{w:t*.5,h:2}),e.jsx($,{w:t*.4,h:Math.max(8,n*.18),strong:!0}),e.jsx($,{w:t*.3,h:2})]})}function el({width:t,height:n}){const o=Math.max(3,Math.min(5,Math.floor(t/100))),s=Math.min(12,n*.35);return e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",height:"100%",padding:"0 8px"},children:Array.from({length:o},(r,i)=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:0,flex:1},children:[e.jsx("div",{style:{width:s,height:s,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:i===0?"var(--agd-bar)":"transparent",flexShrink:0}}),i<o-1&&e.jsx("div",{style:{flex:1,height:1,background:"var(--agd-stroke)",margin:"0 4px"}})]},i))})}function tl({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",borderRadius:4,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"0 6px"},children:[e.jsx($,{w:Math.max(16,t*.5),h:2,strong:!0}),e.jsx("div",{style:{width:8,height:8,borderRadius:"50%",border:"1px solid var(--agd-stroke)",flexShrink:0}})]})}function nl({width:t,height:n}){const s=Math.min(n*.7,t/7.5);return e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",gap:s*.2},children:Array.from({length:5},(r,i)=>e.jsx("svg",{width:s,height:s,viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M8 1.5l2 4 4.5.7-3.25 3.1.75 4.5L8 11.4l-4 2.4.75-4.5L1.5 6.2 6 5.5z",stroke:"var(--agd-stroke)",strokeWidth:"0.8",fill:i<3?"var(--agd-bar)":"none"})},i))})}function ol({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",position:"relative",borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",overflow:"hidden"},children:[e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",style:{position:"absolute",inset:0},children:[e.jsx("line",{x1:0,y1:n*.3,x2:t,y2:n*.7,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".2"}),e.jsx("line",{x1:0,y1:n*.6,x2:t,y2:n*.2,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".15"}),e.jsx("line",{x1:t*.4,y1:0,x2:t*.6,y2:n,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".15"})]}),e.jsx("div",{style:{position:"absolute",left:"50%",top:"40%",transform:"translate(-50%, -100%)"},children:e.jsxs("svg",{width:"16",height:"22",viewBox:"0 0 16 22",fill:"none",children:[e.jsx("path",{d:"M8 0C3.6 0 0 3.6 0 8c0 6 8 14 8 14s8-8 8-14c0-4.4-3.6-8-8-8z",fill:"var(--agd-bar)",opacity:".4"}),e.jsx("circle",{cx:"8",cy:"8",r:"3",fill:"var(--agd-fill)"})]})})]})}function sl({width:t,height:n}){const o=Math.max(3,Math.min(5,Math.floor(n/60)));return e.jsxs("div",{style:{display:"flex",height:"100%",padding:"8px 0"},children:[e.jsx("div",{style:{width:16,display:"flex",flexDirection:"column",alignItems:"center"},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",flex:1},children:[e.jsx(mt,{size:8}),r<o-1&&e.jsx("div",{style:{flex:1,width:1,background:"var(--agd-stroke)"}})]},r))}),e.jsx("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-around",paddingLeft:8},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:`${35+r*13%25}%`,h:3,strong:!0}),e.jsx($,{w:`${50+r*17%30}%`,h:2})]},r))})]})}function rl({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",borderRadius:8,border:"2px dashed var(--agd-stroke)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:n*.06},children:[e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("path",{d:"M12 16V4m0 0l-4 4m4-4l4 4",stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),e.jsx("path",{d:"M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2",stroke:"var(--agd-stroke)",strokeWidth:"1.5"})]}),e.jsx($,{w:t*.4,h:2}),e.jsx($,{w:t*.25,h:2})]})}function il({width:t,height:n}){const o=Math.max(3,Math.min(8,Math.floor(n/20)));return e.jsxs("div",{style:{height:"100%",borderRadius:6,background:"var(--agd-fill)",border:"1px solid var(--agd-stroke)",padding:8,display:"flex",flexDirection:"column",gap:4},children:[e.jsxs("div",{style:{display:"flex",gap:3,marginBottom:4},children:[e.jsx(mt,{size:6}),e.jsx(mt,{size:6}),e.jsx(mt,{size:6})]}),Array.from({length:o},(s,r)=>e.jsx("div",{style:{display:"flex",gap:6,paddingLeft:r>0&&r<o-1?12:0},children:e.jsx($,{w:`${25+r*23%50}%`,h:2,strong:r===0})},r))]})}function ll({width:t,height:n}){const r=Math.min((t-16)/7,(n-40)/6);return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px"},children:[e.jsx("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:"‹"}),e.jsx($,{w:t*.3,h:3,strong:!0}),e.jsx("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:"›"})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:2,padding:"0 4px",flex:1},children:[Array.from({length:7},(i,_)=>e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:r*.6},children:e.jsx($,{w:r*.5,h:2})},`h${_}`)),Array.from({length:35},(i,_)=>e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:r},children:e.jsx("div",{style:{width:r*.6,height:r*.6,borderRadius:"50%",background:_===12?"var(--agd-bar)":"transparent",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("div",{style:{width:2,height:2,borderRadius:1,background:"var(--agd-bar-strong)",opacity:_===12?1:.3}})})},_))]})]})}function al({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[e.jsx(mt,{size:Math.min(32,n*.55)}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:"50%",h:3,strong:!0}),e.jsx($,{w:"75%",h:2})]}),e.jsx($,{w:30,h:2})]})}function cl({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx("div",{style:{height:"50%",background:"var(--agd-fill)",borderBottom:"1px dashed var(--agd-stroke)"}}),e.jsxs("div",{style:{flex:1,padding:10,display:"flex",flexDirection:"column",gap:5},children:[e.jsx($,{w:"65%",h:4,strong:!0}),e.jsx($,{w:"40%",h:3}),e.jsx("div",{style:{flex:1}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx($,{w:"30%",h:5,strong:!0}),e.jsx(He,{w:Math.min(70,t*.3),h:26,radius:4,style:{background:"var(--agd-bar)"}})]})]})]})}function dl({width:t,height:n}){const o=Math.min(48,n*.3);return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:n*.06},children:[e.jsx(mt,{size:o}),e.jsx($,{w:t*.45,h:4,strong:!0}),e.jsx($,{w:t*.3,h:2}),e.jsxs("div",{style:{display:"flex",gap:t*.08,marginTop:n*.04},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[e.jsx($,{w:20,h:3,strong:!0}),e.jsx($,{w:28,h:2})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[e.jsx($,{w:20,h:3,strong:!0}),e.jsx($,{w:28,h:2})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[e.jsx($,{w:20,h:3,strong:!0}),e.jsx($,{w:28,h:2})]})]})]})}function _l({width:t,height:n}){const o=Math.max(t*.6,80),s=Math.max(3,Math.floor(n/40));return e.jsxs("div",{style:{height:"100%",display:"flex"},children:[e.jsx("div",{style:{width:t-o,background:"var(--agd-fill)",opacity:.3}}),e.jsxs("div",{style:{flex:1,borderLeft:"1px solid var(--agd-stroke)",display:"flex",flexDirection:"column",padding:t*.04},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:n*.06},children:[e.jsx($,{w:o*.4,h:4,strong:!0}),e.jsx("div",{style:{width:12,height:12,border:"1px solid var(--agd-stroke)",borderRadius:3}})]}),Array.from({length:s},(r,i)=>e.jsx("div",{style:{padding:"6px 0"},children:e.jsx($,{w:`${50+i*17%35}%`,h:2,strong:i===0})},i))]})]})}function ul({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsxs("div",{style:{flex:1,width:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",padding:10,display:"flex",flexDirection:"column",gap:5},children:[e.jsx($,{w:"70%",h:3,strong:!0}),e.jsx($,{w:"90%",h:2}),e.jsx($,{w:"60%",h:2})]}),e.jsx("div",{style:{width:10,height:10,background:"var(--agd-fill)",border:"1px dashed var(--agd-stroke)",borderTop:"none",borderLeft:"none",transform:"rotate(45deg)",marginTop:-6}})]})}function hl({width:t,height:n}){const o=Math.min(n*.7,t*.3);return e.jsxs("div",{style:{height:"100%",display:"flex",alignItems:"center",gap:t*.08},children:[e.jsx(He,{w:o,h:o,radius:o*.25}),e.jsx($,{w:t*.45,h:Math.max(4,n*.2),strong:!0})]})}function ml({width:t,height:n}){const o=Math.max(2,Math.min(5,Math.floor(n/56)));return e.jsx("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{borderBottom:"1px solid var(--agd-stroke)",padding:"8px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flex:r===0?2:1},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx("span",{style:{fontSize:9,fontWeight:700,color:"var(--agd-stroke)"},children:"Q"}),e.jsx($,{w:t*(.3+r*13%25/100),h:3,strong:!0})]}),e.jsx("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:r===0?"▼":"▶"})]},r))})}function gl({width:t,height:n}){const o=Math.max(2,Math.min(4,Math.floor(t/120))),s=Math.max(1,Math.min(3,Math.floor(n/120)));return e.jsx("div",{style:{display:"grid",gridTemplateColumns:`repeat(${o}, 1fr)`,gridTemplateRows:`repeat(${s}, 1fr)`,gap:4,height:"100%"},children:Array.from({length:o*s},(r,i)=>e.jsx("div",{style:{borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",position:"relative",overflow:"hidden"},children:e.jsxs("svg",{width:"100%",height:"100%",viewBox:"0 0 100 100",preserveAspectRatio:"none",fill:"none",children:[e.jsx("line",{x1:"0",y1:"0",x2:"100",y2:"100",stroke:"var(--agd-stroke)",strokeWidth:"0.5"}),e.jsx("line",{x1:"100",y1:"0",x2:"0",y2:"100",stroke:"var(--agd-stroke)",strokeWidth:"0.5"})]})},i))})}function pl({width:t,height:n}){const o=Math.min(t,n);return e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",children:[e.jsx("rect",{x:"1",y:(n-o+2)/2,width:o-2,height:o-2,rx:o*.15,stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),e.jsx("path",{d:`M${o*.25} ${n/2}l${o*.2} ${o*.2} ${o*.3}-${o*.35}`,stroke:"var(--agd-bar)",strokeWidth:"1.5",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"})]})}function fl({width:t,height:n}){const o=Math.min(t,n)/2-1;return e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",children:[e.jsx("circle",{cx:t/2,cy:n/2,r:o,stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),e.jsx("circle",{cx:t/2,cy:n/2,r:o*.45,fill:"var(--agd-bar)"})]})}function yl({width:t,height:n}){const o=Math.max(2,n*.12),s=Math.min(n*.35,10),r=t*.55;return e.jsxs("div",{style:{height:"100%",display:"flex",alignItems:"center",position:"relative"},children:[e.jsx("div",{style:{width:"100%",height:o,borderRadius:o/2,background:"var(--agd-fill)",border:"1px solid var(--agd-stroke)",position:"relative"},children:e.jsx("div",{style:{width:r,height:"100%",borderRadius:o/2,background:"var(--agd-bar)"}})}),e.jsx("div",{style:{position:"absolute",left:r-s,width:s*2,height:s*2,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:"var(--agd-fill)"}})]})}function xl({width:t,height:n}){const o=Math.min(36,n*.15),s=7,r=4,i=Math.min((t-16)/s,(n-o-40)/(r+1));return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:4},children:[e.jsxs("div",{style:{height:o,borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 8px",justifyContent:"space-between"},children:[e.jsx($,{w:"40%",h:2}),e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("rect",{x:"2",y:"3",width:"12",height:"11",rx:"1",stroke:"var(--agd-stroke)",strokeWidth:"1"}),e.jsx("line",{x1:"2",y1:"6",x2:"14",y2:"6",stroke:"var(--agd-stroke)",strokeWidth:"0.5"})]})]}),e.jsxs("div",{style:{flex:1,borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 6px"},children:[e.jsx("span",{style:{fontSize:7,color:"var(--agd-stroke)"},children:"‹"}),e.jsx($,{w:t*.25,h:2,strong:!0}),e.jsx("span",{style:{fontSize:7,color:"var(--agd-stroke)"},children:"›"})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:`repeat(${s}, 1fr)`,gap:1,padding:"0 4px",flex:1},children:Array.from({length:s*r},(_,y)=>e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:i},children:e.jsx("div",{style:{width:i*.5,height:i*.5,borderRadius:"50%",background:y===10?"var(--agd-bar)":"transparent"},children:e.jsx("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("div",{style:{width:1.5,height:1.5,borderRadius:1,background:"var(--agd-bar-strong)",opacity:y===10?1:.25}})})})},y))})]})]})}function bl({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:n*.08,padding:4},children:[e.jsx("div",{style:{width:"100%",height:n*.2,borderRadius:4,background:"var(--agd-fill)"}}),e.jsx("div",{style:{width:"70%",height:Math.max(6,n*.1),borderRadius:3,background:"var(--agd-fill)"}}),e.jsx("div",{style:{width:"90%",height:Math.max(4,n*.06),borderRadius:3,background:"var(--agd-fill)"}}),e.jsx("div",{style:{width:"50%",height:Math.max(4,n*.06),borderRadius:3,background:"var(--agd-fill)"}})]})}function wl({width:t,height:n}){return e.jsx("div",{style:{height:"100%",display:"flex",alignItems:"center",gap:6},children:e.jsxs("div",{style:{height:"100%",flex:1,borderRadius:n/2,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:`0 ${n*.3}px`,gap:4},children:[e.jsx($,{w:"60%",h:2,strong:!0}),e.jsx("div",{style:{width:Math.max(6,n*.3),height:Math.max(6,n*.3),borderRadius:"50%",border:"1px solid var(--agd-stroke)",flexShrink:0,marginLeft:"auto"}})]})})}function vl({width:t,height:n}){const o=Math.min(t,n);return e.jsx("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",children:e.jsx("path",{d:`M${t/2} ${(n-o)/2+o*.1}l${o*.12} ${o*.25} ${o*.28} ${o*.04}-${o*.2} ${o*.2} ${o*.05} ${o*.28}-${o*.25}-${o*.12}-${o*.25} ${o*.12} ${o*.05}-${o*.28}-${o*.2}-${o*.2} ${o*.28}-${o*.04}z`,stroke:"var(--agd-stroke)",strokeWidth:"1",fill:"var(--agd-fill)"})})}function kl({width:t,height:n}){const o=Math.min(t,n)/2-2;return e.jsxs("svg",{width:"100%",height:"100%",viewBox:`0 0 ${t} ${n}`,fill:"none",children:[e.jsx("circle",{cx:t/2,cy:n/2,r:o,stroke:"var(--agd-stroke)",strokeWidth:"1.5",opacity:".2"}),e.jsx("path",{d:`M${t/2} ${n/2-o}a${o} ${o} 0 0 1 ${o} ${o}`,stroke:"var(--agd-bar-strong)",strokeWidth:"1.5",strokeLinecap:"round"})]})}function jl({width:t,height:n}){const o=Math.min(36,n*.25,t*.12),s=Math.max(1,Math.min(3,Math.floor(n/80)));return e.jsx("div",{style:{display:"flex",flexDirection:"column",height:"100%",justifyContent:"space-around",padding:8},children:Array.from({length:s},(r,i)=>e.jsxs("div",{style:{display:"flex",gap:t*.04,alignItems:"flex-start"},children:[e.jsx(He,{w:o,h:o,radius:o*.25}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[e.jsx($,{w:`${40+i*13%20}%`,h:3,strong:!0}),e.jsx($,{w:`${60+i*17%25}%`,h:2})]})]},i))})}function Cl({width:t,height:n}){const o=Math.max(2,Math.min(4,Math.floor(t/120))),s=Math.min(36,n*.25);return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:n*.06,padding:n*.06},children:[e.jsx($,{w:t*.3,h:4,strong:!0}),e.jsx("div",{style:{display:"flex",gap:t*.06,justifyContent:"center",flex:1,alignItems:"center"},children:Array.from({length:o},(r,i)=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:6},children:[e.jsx(mt,{size:s}),e.jsx($,{w:t*.12,h:3,strong:!0}),e.jsx($,{w:t*.08,h:2})]},i))})]})}function Sl({width:t,height:n}){const o=Math.max(2,Math.min(3,Math.floor(n/80)));return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:t*.06,gap:n*.04},children:[e.jsx($,{w:t*.5,h:Math.max(5,n*.04),strong:!0}),e.jsx($,{w:t*.35,h:2}),e.jsx("div",{style:{width:"100%",display:"flex",flexDirection:"column",gap:n*.03,marginTop:n*.04},children:Array.from({length:o},(s,r)=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:Math.min(60,t*.2),h:2}),e.jsx(He,{w:"100%",h:Math.min(32,n*.1),radius:4})]},r))}),e.jsx(He,{w:"100%",h:Math.min(36,n*.12),radius:6,style:{marginTop:n*.03,background:"var(--agd-bar)"}}),e.jsx($,{w:t*.4,h:2})]})}function Ml({width:t,height:n}){return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column",padding:t*.04,gap:n*.03},children:[e.jsx($,{w:t*.4,h:4,strong:!0}),e.jsx($,{w:t*.6,h:2}),e.jsxs("div",{style:{display:"flex",gap:6,marginTop:n*.03},children:[e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:50,h:2}),e.jsx(He,{w:"100%",h:Math.min(28,n*.1),radius:4})]}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:40,h:2}),e.jsx(He,{w:"100%",h:Math.min(28,n*.1),radius:4})]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[e.jsx($,{w:50,h:2}),e.jsx(He,{w:"100%",h:Math.min(28,n*.1),radius:4})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:3,flex:1},children:[e.jsx($,{w:60,h:2}),e.jsx(He,{w:"100%",h:"100%",radius:4})]}),e.jsx(He,{w:Math.min(120,t*.3),h:Math.min(30,n*.1),radius:6,style:{alignSelf:"flex-end",background:"var(--agd-bar)"}})]})}var $l={navigation:pi,hero:fi,sidebar:yi,footer:xi,modal:bi,card:wi,text:vi,image:ki,table:ji,list:Ci,button:Si,input:Mi,form:$i,tabs:Ii,avatar:Li,badge:Ei,header:Ri,section:Ni,grid:Bi,dropdown:Ti,toggle:Di,search:Pi,toast:Wi,progress:Ai,chart:Oi,video:zi,tooltip:Fi,breadcrumb:Hi,pagination:Yi,divider:Xi,accordion:Ui,carousel:Qi,pricing:Vi,testimonial:qi,cta:Ki,alert:Gi,banner:Zi,stat:Ji,stepper:el,tag:tl,rating:nl,map:ol,timeline:sl,fileUpload:rl,codeBlock:il,calendar:ll,notification:al,productCard:cl,profile:dl,drawer:_l,popover:ul,logo:hl,faq:ml,gallery:gl,checkbox:pl,radio:fl,slider:yl,datePicker:xl,skeleton:bl,chip:wl,icon:vl,spinner:kl,feature:jl,team:Cl,login:Sl,contact:Ml};function Il({type:t,width:n,height:o,text:s}){const r=$l[t];return r?e.jsx("div",{style:{width:"100%",height:"100%",padding:8,position:"relative",pointerEvents:"none"},children:e.jsx(r,{width:n,height:o,text:s})}):e.jsx("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:10,fontWeight:600,color:"var(--agd-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",opacity:.5},children:t})})}var Ll=`svg[fill=none] {
  fill: none !important;
}

.styles-module__overlayExiting___iEmYr {
  opacity: 0 !important;
  transition: opacity 0.25s ease !important;
  pointer-events: none !important;
}

.styles-module__overlay___aWh-q {
  position: fixed;
  inset: 0;
  z-index: 99995;
  pointer-events: auto;
  cursor: default;
  animation: styles-module__overlayFadeIn___aECVy 0.15s ease;
  --agd-stroke: rgba(59, 130, 246, 0.35);
  --agd-fill: rgba(59, 130, 246, 0.06);
  --agd-bar: rgba(59, 130, 246, 0.18);
  --agd-bar-strong: rgba(59, 130, 246, 0.28);
  --agd-text-3: rgba(255, 255, 255, 0.6);
  --agd-surface: #fff;
}
.styles-module__overlay___aWh-q.styles-module__light___ORIft {
  --agd-surface: #fff;
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) {
  --agd-surface: #141414;
}
.styles-module__overlay___aWh-q.styles-module__wireframe___itvQU {
  --agd-stroke: rgba(249, 115, 22, 0.35);
  --agd-fill: rgba(249, 115, 22, 0.06);
  --agd-bar: rgba(249, 115, 22, 0.18);
  --agd-bar-strong: rgba(249, 115, 22, 0.28);
}
.styles-module__overlay___aWh-q.styles-module__placing___45yD8 {
  cursor: crosshair;
}
.styles-module__overlay___aWh-q.styles-module__passthrough___xaFeE {
  pointer-events: none;
}

.styles-module__blankCanvas___t2Eue {
  position: fixed;
  inset: 0;
  z-index: 99994;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.styles-module__blankCanvas___t2Eue.styles-module__visible___OKKqX {
  opacity: var(--canvas-opacity, 1);
  pointer-events: auto;
}
.styles-module__blankCanvas___t2Eue::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 12px 12px;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.styles-module__blankCanvas___t2Eue.styles-module__gridActive___OZ-cf::after {
  opacity: 1;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.22) 1px, transparent 1px);
}

.styles-module__paletteHeader___-Q5gQ {
  padding: 0 1rem 0.375rem;
}

.styles-module__paletteHeaderTitle___oHqZC {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.0094em;
}
.styles-module__light___ORIft .styles-module__paletteHeaderTitle___oHqZC {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__paletteHeaderDesc___6i74T {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
  line-height: 14px;
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T {
  color: rgba(0, 0, 0, 0.45);
}
.styles-module__paletteHeaderDesc___6i74T a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__paletteHeaderDesc___6i74T a:hover {
  color: #fff;
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T a {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T a:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__wireframePurposeWrap___To-tS {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.2s ease, opacity 0.15s ease;
  opacity: 1;
}
.styles-module__wireframePurposeWrap___To-tS.styles-module__collapsed___Ms9vS {
  grid-template-rows: 0fr;
  opacity: 0;
}

.styles-module__wireframePurposeInner___Lrahs {
  overflow: hidden;
}

.styles-module__wireframePurposeInput___7EtBN {
  display: block;
  width: calc(100% - 2rem);
  margin: 0.25rem 1rem 0.375rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__wireframePurposeInput___7EtBN::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__wireframePurposeInput___7EtBN:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.1);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__canvasToggle___-QqSy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin: 0.25rem 1rem 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.styles-module__canvasToggle___-QqSy:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
}
.styles-module__canvasToggle___-QqSy.styles-module__active___hosp7 {
  background: #f97316;
  border-color: transparent;
  border-style: solid;
  box-shadow: none;
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy {
  border-color: rgba(0, 0, 0, 0.08);
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.12);
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy.styles-module__active___hosp7 {
  background: #f97316;
  border-color: transparent;
  border-style: solid;
  box-shadow: none;
}

.styles-module__canvasToggleIcon___7pJ82 {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35);
}
.styles-module__active___hosp7 .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(255, 255, 255, 0.85);
}
.styles-module__light___ORIft .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(0, 0, 0, 0.25);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__canvasToggleLabel___OanpY {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: -0.0094em;
}
.styles-module__active___hosp7 .styles-module__canvasToggleLabel___OanpY {
  color: #fff;
}
.styles-module__light___ORIft .styles-module__canvasToggleLabel___OanpY {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__canvasToggleLabel___OanpY {
  color: #fff;
}

.styles-module__canvasPurposeWrap___hj6zk {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.2s ease, opacity 0.15s ease;
  opacity: 1;
}
.styles-module__canvasPurposeWrap___hj6zk.styles-module__collapsed___Ms9vS {
  grid-template-rows: 0fr;
  opacity: 0;
}

.styles-module__canvasPurposeInner___VWiyu {
  overflow: hidden;
}

.styles-module__canvasPurposeToggle___byDH2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0.375rem 1rem 0.375rem 1.1875rem;
}
.styles-module__canvasPurposeToggle___byDH2 input[type=checkbox] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.styles-module__canvasPurposeCheck___xqd7l {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.25s ease, border-color 0.25s ease;
}
.styles-module__canvasPurposeCheck___xqd7l svg {
  color: #1a1a1a;
  opacity: 1;
  transition: opacity 0.15s ease;
}
.styles-module__canvasPurposeCheck___xqd7l.styles-module__checked___-1JGH {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgb(255, 255, 255);
}
.styles-module__light___ORIft .styles-module__canvasPurposeCheck___xqd7l {
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #fff;
}
.styles-module__light___ORIft .styles-module__canvasPurposeCheck___xqd7l.styles-module__checked___-1JGH {
  border-color: #1a1a1a;
  background: #1a1a1a;
}
.styles-module__light___ORIft .styles-module__canvasPurposeCheck___xqd7l.styles-module__checked___-1JGH svg {
  color: #fff;
}

.styles-module__canvasPurposeLabel___Zu-tD {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.styles-module__light___ORIft .styles-module__canvasPurposeLabel___Zu-tD {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__canvasPurposeHelp___jijwR {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}
.styles-module__canvasPurposeHelp___jijwR svg {
  color: rgba(255, 255, 255, 0.2);
  transform: translateY(2px);
  transition: color 0.15s ease;
}
.styles-module__canvasPurposeHelp___jijwR:hover svg {
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__light___ORIft .styles-module__canvasPurposeHelp___jijwR svg {
  color: rgba(0, 0, 0, 0.2);
}
.styles-module__light___ORIft .styles-module__canvasPurposeHelp___jijwR:hover svg {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__placement___zcxv8 {
  position: absolute;
  border: 1.5px dashed rgba(59, 130, 246, 0.4);
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.08);
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s, opacity 0.15s ease, transform 0.15s ease;
  user-select: none;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  animation: styles-module__placementEnter___TdRhf 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.styles-module__placement___zcxv8:active {
  cursor: grabbing;
}
.styles-module__placement___zcxv8:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
}
.styles-module__placement___zcxv8.styles-module__selected___6yrp6 {
  border-color: #3c82f7;
  border-style: solid;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__placement___zcxv8.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8 {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.08);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8:hover {
  border-color: rgba(249, 115, 22, 0.5);
  background: rgba(249, 115, 22, 0.1);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.12);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8.styles-module__selected___6yrp6 {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.1);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15), 0 2px 8px rgba(249, 115, 22, 0.15);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15), 0 2px 8px rgba(249, 115, 22, 0.15);
}
.styles-module__placement___zcxv8.styles-module__dragging___le6KZ {
  opacity: 0.85;
  z-index: 50;
}
.styles-module__placement___zcxv8.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__placementContent___f64A4 {
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.styles-module__placementLabel___0KvWl {
  position: absolute;
  top: -18px;
  left: 0;
  font-size: 10px;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.7);
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.5);
}
.styles-module__selected___6yrp6 .styles-module__placementLabel___0KvWl {
  color: #3c82f7;
}
.styles-module__wireframe___itvQU .styles-module__placementLabel___0KvWl {
  color: rgba(249, 115, 22, 0.7);
}
.styles-module__wireframe___itvQU .styles-module__selected___6yrp6 .styles-module__placementLabel___0KvWl {
  color: #f97316;
}

.styles-module__placementAnnotation___78pTr {
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  font-weight: 450;
  color: rgba(0, 0, 0, 0.5);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.styles-module__placementAnnotation___78pTr.styles-module__annotationVisible___mrUyA {
  opacity: 1;
  transform: translateY(0);
}

.styles-module__sectionAnnotation___aUIs0 {
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  font-weight: 450;
  color: rgba(59, 130, 246, 0.6);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.styles-module__sectionAnnotation___aUIs0.styles-module__annotationVisible___mrUyA {
  opacity: 1;
  transform: translateY(0);
}

.styles-module__handle___Ikbxm {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 1.5px solid #3c82f7;
  border-radius: 2px;
  z-index: 12;
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transform: scale(0.3);
  pointer-events: none;
  will-change: opacity, transform;
  transition: opacity 0.2s ease-out, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.styles-module__placement___zcxv8:hover .styles-module__handle___Ikbxm, .styles-module__sectionOutline___s0hy-:hover .styles-module__handle___Ikbxm, .styles-module__ghostOutline___po-kO:hover .styles-module__handle___Ikbxm, .styles-module__placement___zcxv8:active .styles-module__handle___Ikbxm, .styles-module__sectionOutline___s0hy-:active .styles-module__handle___Ikbxm, .styles-module__ghostOutline___po-kO:active .styles-module__handle___Ikbxm, .styles-module__selected___6yrp6 .styles-module__handle___Ikbxm {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.styles-module__sectionOutline___s0hy- .styles-module__handle___Ikbxm {
  border-color: inherit;
}
.styles-module__wireframe___itvQU .styles-module__handle___Ikbxm {
  border-color: #f97316;
}

.styles-module__handleNw___4TMIj {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.styles-module__handleNe___mnsTh {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.styles-module__handleSe___oSFnk {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.styles-module__handleSw___pi--Z {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.styles-module__handleN___aBA-Q, .styles-module__handleE___0hM5u, .styles-module__handleS___JjDRv, .styles-module__handleW___ERWGQ {
  opacity: 0 !important;
  pointer-events: none !important;
}

.styles-module__edgeHandle___XxXdT {
  position: absolute;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
}
.styles-module__edgeHandle___XxXdT::after {
  content: "";
  position: absolute;
  border-radius: 4px;
  background: #3c82f7;
}
.styles-module__wireframe___itvQU .styles-module__edgeHandle___XxXdT::after {
  background: #f97316;
}
.styles-module__edgeHandle___XxXdT::after {
  opacity: 0;
  transition: opacity 0.1s ease, transform 0.1s ease;
  transform: scale(0.8);
}
.styles-module__edgeHandle___XxXdT:hover::after {
  opacity: 0.85;
  transform: scale(1);
}
.styles-module__edgeHandle___XxXdT svg {
  position: relative;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.1s ease;
  filter: drop-shadow(0 0 2px var(--agd-surface));
}
.styles-module__edgeHandle___XxXdT:hover svg {
  opacity: 1;
}

.styles-module__edgeN___-JJDj, .styles-module__edgeS___66lMX {
  left: 12px;
  right: 12px;
  height: 12px;
  cursor: n-resize;
}
.styles-module__edgeN___-JJDj::after, .styles-module__edgeS___66lMX::after {
  width: 24px;
  height: 4px;
}

.styles-module__edgeN___-JJDj {
  top: -6px;
}

.styles-module__edgeS___66lMX {
  bottom: -6px;
  cursor: s-resize;
}

.styles-module__edgeE___1bGDa, .styles-module__edgeW___lHQNo {
  top: 12px;
  bottom: 12px;
  width: 12px;
  cursor: e-resize;
}
.styles-module__edgeE___1bGDa::after, .styles-module__edgeW___lHQNo::after {
  width: 4px;
  height: 24px;
}

.styles-module__edgeE___1bGDa {
  right: -6px;
}

.styles-module__edgeW___lHQNo {
  left: -6px;
  cursor: w-resize;
}

.styles-module__deleteButton___LkGCb {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.8);
  will-change: opacity, transform;
  transition: opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.12s ease, color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}
.styles-module__placement___zcxv8:hover .styles-module__deleteButton___LkGCb, .styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb, .styles-module__sectionOutline___s0hy-:hover .styles-module__deleteButton___LkGCb, .styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb, .styles-module__ghostOutline___po-kO:hover .styles-module__deleteButton___LkGCb, .styles-module__ghostOutline___po-kO.styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.styles-module__deleteButton___LkGCb:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb, .styles-module__rearrangeOverlay___-3R3t:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb {
  background: rgba(40, 40, 40, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb:hover, .styles-module__rearrangeOverlay___-3R3t:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.styles-module__drawBox___BrVAa {
  position: fixed;
  pointer-events: none;
  z-index: 99996;
  border: 2px solid #3c82f7;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.15);
}

.styles-module__selectBox___Iu8kB {
  position: fixed;
  pointer-events: none;
  z-index: 99996;
  border: 1px dashed #3c82f7;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 2px;
}

.styles-module__sizeIndicator___7zJ4y {
  position: fixed;
  pointer-events: none;
  z-index: 100001;
  font-size: 10px;
  color: #fff;
  background: #3c82f7;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.styles-module__guideLine___DUQY2 {
  pointer-events: none;
  z-index: 100001;
  background: #f0f;
  opacity: 0.5;
}

.styles-module__dragPreview___onPbU {
  position: fixed;
  z-index: 100002;
  pointer-events: none;
  border: 1.5px dashed #3c82f7;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: #3c82f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  transition: width 0.08s ease, height 0.08s ease, opacity 0.08s ease;
}

.styles-module__dragPreviewWireframe___jsg0G {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.15);
}

.styles-module__palette___C7iSH {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  width: 256px;
  overflow: hidden;
  background: #1c1c1c;
  border: none;
  border-radius: 1rem;
  padding: 13px 0 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  z-index: 100001;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: default;
  opacity: 0;
  filter: blur(5px);
}
.styles-module__palette___C7iSH .styles-module__paletteItem___6TlnA,
.styles-module__palette___C7iSH .styles-module__paletteItemLabel___6ncO4,
.styles-module__palette___C7iSH .styles-module__paletteSectionTitle___PqnjX,
.styles-module__palette___C7iSH .styles-module__paletteFooter___QYnAG {
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__palette___C7iSH.styles-module__enter___6LYk5 {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0px);
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.styles-module__palette___C7iSH.styles-module__exit___iSGRw {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(5px);
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.1s ease, filter 0.1s ease;
}
.styles-module__palette___C7iSH.styles-module__light___ORIft {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.styles-module__paletteSection___V8DEA {
  padding: 0 1rem;
}
.styles-module__paletteSection___V8DEA + .styles-module__paletteSection___V8DEA {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__light___ORIft .styles-module__paletteSection___V8DEA + .styles-module__paletteSection___V8DEA {
  border-top-color: rgba(0, 0, 0, 0.07);
}

.styles-module__paletteSectionTitle___PqnjX {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  padding: 0 0 3px 3px;
}
.styles-module__light___ORIft .styles-module__paletteSectionTitle___PqnjX {
  color: rgba(0, 0, 0, 0.4);
}

.styles-module__paletteItem___6TlnA {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.25rem;
  margin-bottom: 1px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  border: 1px solid transparent;
  user-select: none;
  min-height: 24px;
}
.styles-module__paletteItem___6TlnA:hover {
  background: rgba(255, 255, 255, 0.1);
}
.styles-module__paletteItem___6TlnA.styles-module__active___hosp7 {
  background: #3c82f7;
  border-color: transparent;
}
.styles-module__paletteItem___6TlnA.styles-module__wireframe___itvQU.styles-module__active___hosp7 {
  background: #f97316;
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA:hover {
  background: rgba(0, 0, 0, 0.05);
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA.styles-module__active___hosp7 {
  background: #3c82f7;
  border-color: transparent;
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA.styles-module__wireframe___itvQU.styles-module__active___hosp7 {
  background: #f97316;
}

.styles-module__paletteItemIcon___0NPQK {
  width: 20px;
  height: 16px;
  border-radius: 2px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.45);
}
.styles-module__paletteItemIcon___0NPQK svg {
  display: block;
  width: 20px;
  height: 16px;
}
.styles-module__active___hosp7 .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.styles-module__light___ORIft .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.styles-module__paletteItemLabel___6ncO4 {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: -0.0094em;
  line-height: 1;
  min-width: 0;
}
.styles-module__active___hosp7 .styles-module__paletteItemLabel___6ncO4 {
  color: #fff;
  font-weight: 600;
}
.styles-module__light___ORIft .styles-module__paletteItemLabel___6ncO4 {
  color: rgba(0, 0, 0, 0.7);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__paletteItemLabel___6ncO4 {
  color: #fff;
  font-weight: 600;
}

.styles-module__placeScroll___7sClM {
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 0.25rem;
}
.styles-module__placeScroll___7sClM.styles-module__fadeTop___KT9tF {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 32px);
  mask-image: linear-gradient(to bottom, transparent 0, black 32px);
}
.styles-module__placeScroll___7sClM.styles-module__fadeBottom___x3ShT {
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 32px), transparent 100%);
  mask-image: linear-gradient(to bottom, black calc(100% - 32px), transparent 100%);
}
.styles-module__placeScroll___7sClM.styles-module__fadeTop___KT9tF.styles-module__fadeBottom___x3ShT {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
}
.styles-module__placeScroll___7sClM::-webkit-scrollbar {
  width: 3px;
}
.styles-module__placeScroll___7sClM::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}
.styles-module__light___ORIft .styles-module__placeScroll___7sClM::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

.styles-module__paletteFooterWrap___71-fI {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__paletteFooterWrap___71-fI.styles-module__footerHidden___fJUik {
  grid-template-rows: 0fr;
}

.styles-module__paletteFooterInnerContent___VC26h {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.styles-module__footerHidden___fJUik .styles-module__paletteFooterInnerContent___VC26h {
  opacity: 0;
  transform: translateY(4px);
}

.styles-module__paletteFooterInner___dfylY {
  overflow: hidden;
}

.styles-module__paletteFooter___QYnAG {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  padding: 0 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__light___ORIft .styles-module__paletteFooter___QYnAG {
  border-top-color: rgba(0, 0, 0, 0.07);
}

.styles-module__paletteFooterCount___D3Fia {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__light___ORIft .styles-module__paletteFooterCount___D3Fia {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__paletteFooterClear___ybBoa {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s ease;
}
.styles-module__paletteFooterClear___ybBoa:hover {
  color: rgba(255, 255, 255, 0.7);
}
.styles-module__light___ORIft .styles-module__paletteFooterClear___ybBoa {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___ORIft .styles-module__paletteFooterClear___ybBoa:hover {
  color: rgba(0, 0, 0, 0.6);
}

.styles-module__paletteFooterActions___fLzv8 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.styles-module__rollingWrap___S75jM {
  display: inline-block;
  overflow: hidden;
  height: 1.15em;
  position: relative;
  vertical-align: bottom;
}

.styles-module__rollingNum___1RKDx {
  position: absolute;
  left: 0;
  top: 0;
}

.styles-module__exitUp___AFDRW {
  animation: styles-module__numExitUp___FRQqx 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__enterUp___CPlXb {
  animation: styles-module__numEnterUp___2Yd-w 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__exitDown___-1yAy {
  animation: styles-module__numExitDown___xm5by 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__enterDown___DDuFR {
  animation: styles-module__numEnterDown___hpxBk 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

@keyframes styles-module__numExitUp___FRQqx {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-110%);
    opacity: 0;
  }
}
@keyframes styles-module__numEnterUp___2Yd-w {
  from {
    transform: translateY(110%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes styles-module__numExitDown___xm5by {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(110%);
    opacity: 0;
  }
}
@keyframes styles-module__numEnterDown___hpxBk {
  from {
    transform: translateY(-110%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.styles-module__rearrangeOverlay___-3R3t {
  position: fixed;
  inset: 0;
  z-index: 99995;
  pointer-events: none;
  cursor: default;
  user-select: none;
  animation: styles-module__overlayFadeIn___aECVy 0.15s ease;
}

.styles-module__hoverHighlight___8eT-v {
  position: fixed;
  pointer-events: none;
  z-index: 99994;
  border: 2px dashed rgba(59, 130, 246, 0.5);
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.06);
  animation: styles-module__highlightFadeIn___Lg7KY 0.12s ease;
}

.styles-module__sectionOutline___s0hy- {
  position: fixed;
  border: 2px solid;
  border-radius: 4px;
  cursor: grab;
}
.styles-module__sectionOutline___s0hy-:active {
  cursor: grabbing;
}
.styles-module__sectionOutline___s0hy- {
  transition: box-shadow 0.15s, border-color 0.3s, background-color 0.3s, border-style 0s;
  user-select: none;
  pointer-events: auto;
  animation: styles-module__sectionEnter___-8BXT 0.2s ease;
}
.styles-module__sectionOutline___s0hy-:hover {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6 {
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) {
  border: 1.5px dashed rgba(150, 150, 150, 0.35);
  background-color: transparent !important;
  box-shadow: none;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover {
  border-color: rgba(150, 150, 150, 0.6);
  box-shadow: none;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__sectionLabel___F80HQ {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover .styles-module__sectionLabel___F80HQ {
  opacity: 1;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__movedBadge___s8z-q,
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__sectionDimensions___RcJSL {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover .styles-module__sectionDimensions___RcJSL {
  opacity: 1;
}
.styles-module__sectionOutline___s0hy-.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__sectionLabel___F80HQ {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  max-width: calc(100% - 8px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__movedBadge___s8z-q {
  position: absolute;
  bottom: 22px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  background: #22c55e;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.styles-module__movedBadge___s8z-q.styles-module__badgeVisible___npbdS {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.2s cubic-bezier(0.34, 1.2, 0.64, 1), transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.styles-module__resizedBadge___u51V8 {
  background: #3c82f7;
  bottom: 40px;
}

.styles-module__sectionDimensions___RcJSL {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.styles-module__light___ORIft .styles-module__sectionDimensions___RcJSL {
  color: rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.7);
}

.styles-module__wireframeNotice___4GJyB {
  position: fixed;
  bottom: 16px;
  left: 24px;
  z-index: 99995;
  font-size: 9.5px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.4);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  pointer-events: auto;
  animation: styles-module__overlayFadeIn___aECVy 0.3s ease;
  line-height: 1.5;
  max-width: 280px;
}

.styles-module__wireframeOpacityRow___CJXzi {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.styles-module__wireframeOpacityLabel___afkfT {
  font-size: 9px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.32);
  letter-spacing: 0.02em;
  white-space: nowrap;
  user-select: none;
}

.styles-module__wireframeOpacitySlider___YcoEs {
  -webkit-appearance: none;
  appearance: none;
  width: 56px;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.styles-module__wireframeOpacitySlider___YcoEs:hover {
  background: rgba(0, 0, 0, 0.13);
}
.styles-module__wireframeOpacitySlider___YcoEs::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f97316;
  cursor: pointer;
  transition: background 0.15s ease;
}
.styles-module__wireframeOpacitySlider___YcoEs::-webkit-slider-thumb:hover {
  background: rgb(224.4209205021, 95.3548117155, 5.7790794979);
}
.styles-module__wireframeOpacitySlider___YcoEs::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f97316;
  border: none;
  cursor: pointer;
}
.styles-module__wireframeOpacitySlider___YcoEs::-moz-range-track {
  background: rgba(0, 0, 0, 0.08);
  height: 4px;
  border-radius: 2px;
}

.styles-module__wireframeNoticeTitleRow___PJqyG {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 2px;
}

.styles-module__wireframeNoticeTitle___okr08 {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
}

.styles-module__wireframeNoticeDivider___PNKQ6 {
  width: 1px;
  height: 8px;
  background: rgba(0, 0, 0, 0.12);
  margin: 0 8px;
  flex-shrink: 0;
}

.styles-module__wireframeStartOver___YFk-I {
  font-size: 9.5px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  text-decoration: none;
  transition: color 0.12s ease;
  white-space: nowrap;
}
.styles-module__wireframeStartOver___YFk-I:hover {
  color: rgba(0, 0, 0, 0.6);
}

.styles-module__ghostOutline___po-kO {
  position: fixed;
  border: 1.5px dashed rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.04);
  cursor: grab;
  opacity: 0.5;
  user-select: none;
  pointer-events: auto;
  animation: styles-module__ghostEnter___EC3Mb 0.25s ease;
  transition: box-shadow 0.15s, border-color 0.3s, opacity 0.25s;
}
.styles-module__ghostOutline___po-kO:active {
  cursor: grabbing;
}
.styles-module__ghostOutline___po-kO:hover {
  opacity: 0.7;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
}
.styles-module__ghostOutline___po-kO.styles-module__selected___6yrp6 {
  opacity: 1;
  border-style: solid;
  border-width: 2px;
  border-color: #3c82f7;
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__ghostOutline___po-kO.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__ghostBadge___tsQUK {
  position: absolute;
  bottom: calc(100% + 4px);
  left: -1px;
  font-size: 9px;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.9);
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: 0.02em;
  line-height: 1.2;
  animation: styles-module__badgeSlideIn___typJ7 0.2s ease both;
}

@keyframes styles-module__badgeSlideIn___typJ7 {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.styles-module__ghostBadgeExtra___6CVoD {
  display: inline;
  animation: styles-module__badgeExtraIn___i4W8F 0.2s ease both;
}

@keyframes styles-module__badgeExtraIn___i4W8F {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.styles-module__originalOutline___Y6DD1 {
  position: fixed;
  border: 1.5px dashed rgba(150, 150, 150, 0.3);
  border-radius: 4px;
  background: transparent;
  pointer-events: none;
  user-select: none;
  animation: styles-module__sectionEnter___-8BXT 0.2s ease;
}

.styles-module__originalLabel___HqI9g {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 9px;
  font-weight: 500;
  color: rgba(150, 150, 150, 0.5);
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: rgba(150, 150, 150, 0.08);
}

.styles-module__connectorSvg___Lovld {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99996;
}

.styles-module__connectorLine___XeWh- {
  transition: opacity 0.2s ease;
  animation: styles-module__connectorDraw___8sK5I 0.3s ease both;
}

.styles-module__connectorDot___yvf7C {
  transform-box: fill-box;
  transform-origin: center;
  animation: styles-module__connectorDotIn___NwTUq 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

@keyframes styles-module__connectorDraw___8sK5I {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__connectorDotIn___NwTUq {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.styles-module__connectorExiting___2lLOs {
  animation: styles-module__connectorOut___5QoPl 0.2s ease forwards;
}
.styles-module__connectorExiting___2lLOs .styles-module__connectorDot___yvf7C {
  animation: styles-module__connectorDotOut___FEq7e 0.2s ease forwards;
}

@keyframes styles-module__connectorOut___5QoPl {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes styles-module__connectorDotOut___FEq7e {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
}
@keyframes styles-module__placementEnter___TdRhf {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__sectionEnter___-8BXT {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__highlightFadeIn___Lg7KY {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__overlayFadeIn___aECVy {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__ghostEnter___EC3Mb {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 0.6;
    transform: scale(1);
  }
}`,El={overlayExiting:"styles-module__overlayExiting___iEmYr",overlay:"styles-module__overlay___aWh-q",overlayFadeIn:"styles-module__overlayFadeIn___aECVy",light:"styles-module__light___ORIft",wireframe:"styles-module__wireframe___itvQU",placing:"styles-module__placing___45yD8",passthrough:"styles-module__passthrough___xaFeE",blankCanvas:"styles-module__blankCanvas___t2Eue",visible:"styles-module__visible___OKKqX",gridActive:"styles-module__gridActive___OZ-cf",paletteHeader:"styles-module__paletteHeader___-Q5gQ",paletteHeaderTitle:"styles-module__paletteHeaderTitle___oHqZC",paletteHeaderDesc:"styles-module__paletteHeaderDesc___6i74T",wireframePurposeWrap:"styles-module__wireframePurposeWrap___To-tS",collapsed:"styles-module__collapsed___Ms9vS",wireframePurposeInner:"styles-module__wireframePurposeInner___Lrahs",wireframePurposeInput:"styles-module__wireframePurposeInput___7EtBN",canvasToggle:"styles-module__canvasToggle___-QqSy",active:"styles-module__active___hosp7",canvasToggleIcon:"styles-module__canvasToggleIcon___7pJ82",canvasToggleLabel:"styles-module__canvasToggleLabel___OanpY",canvasPurposeWrap:"styles-module__canvasPurposeWrap___hj6zk",canvasPurposeInner:"styles-module__canvasPurposeInner___VWiyu",canvasPurposeToggle:"styles-module__canvasPurposeToggle___byDH2",canvasPurposeCheck:"styles-module__canvasPurposeCheck___xqd7l",checked:"styles-module__checked___-1JGH",canvasPurposeLabel:"styles-module__canvasPurposeLabel___Zu-tD",canvasPurposeHelp:"styles-module__canvasPurposeHelp___jijwR",placement:"styles-module__placement___zcxv8",placementEnter:"styles-module__placementEnter___TdRhf",selected:"styles-module__selected___6yrp6",dragging:"styles-module__dragging___le6KZ",exiting:"styles-module__exiting___YrM8F",placementContent:"styles-module__placementContent___f64A4",placementLabel:"styles-module__placementLabel___0KvWl",placementAnnotation:"styles-module__placementAnnotation___78pTr",annotationVisible:"styles-module__annotationVisible___mrUyA",sectionAnnotation:"styles-module__sectionAnnotation___aUIs0",handle:"styles-module__handle___Ikbxm",sectionOutline:"styles-module__sectionOutline___s0hy-",ghostOutline:"styles-module__ghostOutline___po-kO",handleNw:"styles-module__handleNw___4TMIj",handleNe:"styles-module__handleNe___mnsTh",handleSe:"styles-module__handleSe___oSFnk",handleSw:"styles-module__handleSw___pi--Z",handleN:"styles-module__handleN___aBA-Q",handleE:"styles-module__handleE___0hM5u",handleS:"styles-module__handleS___JjDRv",handleW:"styles-module__handleW___ERWGQ",edgeHandle:"styles-module__edgeHandle___XxXdT",edgeN:"styles-module__edgeN___-JJDj",edgeS:"styles-module__edgeS___66lMX",edgeE:"styles-module__edgeE___1bGDa",edgeW:"styles-module__edgeW___lHQNo",deleteButton:"styles-module__deleteButton___LkGCb",rearrangeOverlay:"styles-module__rearrangeOverlay___-3R3t",drawBox:"styles-module__drawBox___BrVAa",selectBox:"styles-module__selectBox___Iu8kB",sizeIndicator:"styles-module__sizeIndicator___7zJ4y",guideLine:"styles-module__guideLine___DUQY2",dragPreview:"styles-module__dragPreview___onPbU",dragPreviewWireframe:"styles-module__dragPreviewWireframe___jsg0G",palette:"styles-module__palette___C7iSH",paletteItem:"styles-module__paletteItem___6TlnA",paletteItemLabel:"styles-module__paletteItemLabel___6ncO4",paletteSectionTitle:"styles-module__paletteSectionTitle___PqnjX",paletteFooter:"styles-module__paletteFooter___QYnAG",enter:"styles-module__enter___6LYk5",exit:"styles-module__exit___iSGRw",paletteSection:"styles-module__paletteSection___V8DEA",paletteItemIcon:"styles-module__paletteItemIcon___0NPQK",placeScroll:"styles-module__placeScroll___7sClM",fadeTop:"styles-module__fadeTop___KT9tF",fadeBottom:"styles-module__fadeBottom___x3ShT",paletteFooterWrap:"styles-module__paletteFooterWrap___71-fI",footerHidden:"styles-module__footerHidden___fJUik",paletteFooterInnerContent:"styles-module__paletteFooterInnerContent___VC26h",paletteFooterInner:"styles-module__paletteFooterInner___dfylY",paletteFooterCount:"styles-module__paletteFooterCount___D3Fia",paletteFooterClear:"styles-module__paletteFooterClear___ybBoa",paletteFooterActions:"styles-module__paletteFooterActions___fLzv8",rollingWrap:"styles-module__rollingWrap___S75jM",rollingNum:"styles-module__rollingNum___1RKDx",exitUp:"styles-module__exitUp___AFDRW",numExitUp:"styles-module__numExitUp___FRQqx",enterUp:"styles-module__enterUp___CPlXb",numEnterUp:"styles-module__numEnterUp___2Yd-w",exitDown:"styles-module__exitDown___-1yAy",numExitDown:"styles-module__numExitDown___xm5by",enterDown:"styles-module__enterDown___DDuFR",numEnterDown:"styles-module__numEnterDown___hpxBk",hoverHighlight:"styles-module__hoverHighlight___8eT-v",highlightFadeIn:"styles-module__highlightFadeIn___Lg7KY",sectionEnter:"styles-module__sectionEnter___-8BXT",settled:"styles-module__settled___b5U5o",sectionLabel:"styles-module__sectionLabel___F80HQ",movedBadge:"styles-module__movedBadge___s8z-q",sectionDimensions:"styles-module__sectionDimensions___RcJSL",badgeVisible:"styles-module__badgeVisible___npbdS",resizedBadge:"styles-module__resizedBadge___u51V8",wireframeNotice:"styles-module__wireframeNotice___4GJyB",wireframeOpacityRow:"styles-module__wireframeOpacityRow___CJXzi",wireframeOpacityLabel:"styles-module__wireframeOpacityLabel___afkfT",wireframeOpacitySlider:"styles-module__wireframeOpacitySlider___YcoEs",wireframeNoticeTitleRow:"styles-module__wireframeNoticeTitleRow___PJqyG",wireframeNoticeTitle:"styles-module__wireframeNoticeTitle___okr08",wireframeNoticeDivider:"styles-module__wireframeNoticeDivider___PNKQ6",wireframeStartOver:"styles-module__wireframeStartOver___YFk-I",ghostEnter:"styles-module__ghostEnter___EC3Mb",ghostBadge:"styles-module__ghostBadge___tsQUK",badgeSlideIn:"styles-module__badgeSlideIn___typJ7",ghostBadgeExtra:"styles-module__ghostBadgeExtra___6CVoD",badgeExtraIn:"styles-module__badgeExtraIn___i4W8F",originalOutline:"styles-module__originalOutline___Y6DD1",originalLabel:"styles-module__originalLabel___HqI9g",connectorSvg:"styles-module__connectorSvg___Lovld",connectorLine:"styles-module__connectorLine___XeWh-",connectorDraw:"styles-module__connectorDraw___8sK5I",connectorDot:"styles-module__connectorDot___yvf7C",connectorDotIn:"styles-module__connectorDotIn___NwTUq",connectorExiting:"styles-module__connectorExiting___2lLOs",connectorOut:"styles-module__connectorOut___5QoPl",connectorDotOut:"styles-module__connectorDotOut___FEq7e"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-design-mode-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-design-mode-styles",document.head.appendChild(t)),t.textContent=Ll}var j=El,bn=24,oo=5;function Ls(t,n,o,s,r){let i=1/0,_=1/0;const y=t.x,g=t.x+t.width,N=t.x+t.width/2,f=t.y,R=t.y+t.height,b=t.y+t.height/2,z=!s,v=z?[y,g,N]:[...s.left?[y]:[],...s.right?[g]:[]],T=z?[f,R,b]:[...s.top?[f]:[],...s.bottom?[R]:[]],w=[];for(const ye of n)o.has(ye.id)||w.push(ye);r&&w.push(...r);for(const ye of w){const ze=ye.x,Ue=ye.x+ye.width,xe=ye.x+ye.width/2,Se=ye.y,q=ye.y+ye.height,rt=ye.y+ye.height/2;for(const P of v)for(const ce of[ze,Ue,xe]){const Re=ce-P;Math.abs(Re)<oo&&Math.abs(Re)<Math.abs(i)&&(i=Re)}for(const P of T)for(const ce of[Se,q,rt]){const Re=ce-P;Math.abs(Re)<oo&&Math.abs(Re)<Math.abs(_)&&(_=Re)}}const I=Math.abs(i)<oo?i:0,X=Math.abs(_)<oo?_:0,ae=[],re=new Set,Ye=y+I,Xe=g+I,Q=N+I,Ve=f+X,We=R+X,Me=b+X;for(const ye of w){const ze=ye.x,Ue=ye.x+ye.width,xe=ye.x+ye.width/2,Se=ye.y,q=ye.y+ye.height,rt=ye.y+ye.height/2;for(const P of[ze,xe,Ue])for(const ce of[Ye,Q,Xe])if(Math.abs(ce-P)<.5){const Re=`x:${Math.round(P)}`;re.has(Re)||(re.add(Re),ae.push({axis:"x",pos:P}))}for(const P of[Se,rt,q])for(const ce of[Ve,Me,We])if(Math.abs(ce-P)<.5){const Re=`y:${Math.round(P)}`;re.has(Re)||(re.add(Re),ae.push({axis:"y",pos:P}))}}return{dx:I,dy:X,guides:ae}}function Es(){return`dp-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}function Rl({placements:t,onChange:n,activeComponent:o,onActiveComponentChange:s,isDarkMode:r,exiting:i,onInteractionChange:_,className:y,passthrough:g,extraSnapRects:N,onSelectionChange:f,deselectSignal:R,onDragMove:b,onDragEnd:z,clearSignal:v,wireframe:T}){const[w,I]=c.useState(new Set),[X,ae]=c.useState(null),[re,Ye]=c.useState(null),[Xe,Q]=c.useState(null),[Ve,We]=c.useState([]),[Me,ye]=c.useState(null),[ze,Ue]=c.useState(!1),xe=c.useRef(!1),[Se,q]=c.useState(new Set),rt=c.useRef(new Map),P=c.useRef(null),ce=c.useRef(null),Re=c.useRef(t);Re.current=t;const Je=c.useRef(f);Je.current=f;const gt=c.useRef(b);gt.current=b;const ut=c.useRef(z);ut.current=z;const Yt=c.useRef(R);c.useEffect(()=>{R!==Yt.current&&(Yt.current=R,I(new Set))},[R]);const bt=c.useRef(v);c.useEffect(()=>{if(v!==void 0&&v!==bt.current){bt.current=v;const C=new Set(Re.current.map(G=>G.id));C.size>0&&(q(C),I(new Set),ce.current=null,ne(()=>{n([]),q(new Set)},180))}},[v,n]),c.useEffect(()=>{const C=G=>{const pe=G.target;if(!(pe.tagName==="INPUT"||pe.tagName==="TEXTAREA"||pe.isContentEditable)){if((G.key==="Backspace"||G.key==="Delete")&&w.size>0){G.preventDefault();const me=new Set(w);q(me),I(new Set),ne(()=>{n(Re.current.filter(Be=>!me.has(Be.id))),q(new Set)},180);return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(G.key)&&w.size>0){G.preventDefault();const me=G.shiftKey?20:1,Be=G.key==="ArrowLeft"?-me:G.key==="ArrowRight"?me:0,Ne=G.key==="ArrowUp"?-me:G.key==="ArrowDown"?me:0;n(t.map(be=>w.has(be.id)?{...be,x:Math.max(0,be.x+Be),y:Math.max(0,be.y+Ne)}:be));return}if(G.key==="Escape"){o?s(null):w.size>0&&I(new Set);return}}};return document.addEventListener("keydown",C),()=>document.removeEventListener("keydown",C)},[w,o,t,n,s]);const Xt=c.useCallback(C=>{if(C.button!==0||g||C.target.closest(`.${j.placement}`))return;C.preventDefault(),C.stopPropagation();const pe=window.scrollY,ie=C.clientX,me=C.clientY;if(o){ce.current="place",_?.(!0);let Be=!1,Ne=ie,be=me;const Te=ee=>{Ne=ee.clientX,be=ee.clientY;const p=Math.abs(Ne-ie),x=Math.abs(be-me);if((p>5||x>5)&&(Be=!0),Be){const M=Math.min(ie,Ne),L=Math.min(me,be),V=Math.abs(Ne-ie),A=Math.abs(be-me);ae({x:M,y:L,w:V,h:A}),Q({x:ee.clientX+12,y:ee.clientY+12,text:`${Math.round(V)} × ${Math.round(A)}`})}},Ke=ee=>{window.removeEventListener("mousemove",Te),window.removeEventListener("mouseup",Ke),ae(null),Q(null),ce.current=null,_?.(!1);const p=O[o];let x,M,L,V;Be?(x=Math.min(ie,Ne),M=Math.min(me,be)+pe,L=Math.max(bn,Math.abs(Ne-ie)),V=Math.max(bn,Math.abs(be-me))):(L=p.width,V=p.height,x=ie-L/2,M=me+pe-V/2),x=Math.max(0,x),M=Math.max(0,M);const A={id:Es(),type:o,x,y:M,width:L,height:V,scrollY:pe,timestamp:Date.now()},B=[...t,A];n(B),I(new Set([A.id])),s(null)};window.addEventListener("mousemove",Te),window.addEventListener("mouseup",Ke)}else{C.shiftKey||I(new Set),ce.current="select";let Be=!1;const Ne=Te=>{const Ke=Math.abs(Te.clientX-ie),ee=Math.abs(Te.clientY-me);if((Ke>4||ee>4)&&(Be=!0),Be){const p=Math.min(ie,Te.clientX),x=Math.min(me,Te.clientY);Ye({x:p,y:x,w:Math.abs(Te.clientX-ie),h:Math.abs(Te.clientY-me)})}},be=Te=>{if(window.removeEventListener("mousemove",Ne),window.removeEventListener("mouseup",be),ce.current=null,Be){const Ke=Math.min(ie,Te.clientX),ee=Math.min(me,Te.clientY)+pe,p=Math.abs(Te.clientX-ie),x=Math.abs(Te.clientY-me),M=new Set(C.shiftKey?w:new Set);for(const L of t)L.y-pe,L.x+L.width>Ke&&L.x<Ke+p&&L.y+L.height>ee&&L.y<ee+x&&M.add(L.id);I(M)}Ye(null)};window.addEventListener("mousemove",Ne),window.addEventListener("mouseup",be)}},[o,g,t,n,w]),Mt=c.useCallback((C,G)=>{if(C.button!==0)return;const pe=C.target;if(pe.closest(`.${j.handle}`)||pe.closest(`.${j.deleteButton}`))return;C.preventDefault(),C.stopPropagation();let ie;C.shiftKey?(ie=new Set(w),ie.has(G)?ie.delete(G):ie.add(G)):w.has(G)?ie=new Set(w):ie=new Set([G]),I(ie),(ie.size!==w.size||[...ie].some(A=>!w.has(A)))&&Je.current?.(ie,C.shiftKey);const Be=C.clientX,Ne=C.clientY,be=new Map;for(const A of t)ie.has(A.id)&&be.set(A.id,{x:A.x,y:A.y});ce.current="move",_?.(!0);let Te=!1,Ke=!1,ee=t,p=0,x=0;const M=new Map;for(const A of t)be.has(A.id)&&M.set(A.id,{w:A.width,h:A.height});const L=A=>{const B=A.clientX-Be,ue=A.clientY-Ne;if((Math.abs(B)>2||Math.abs(ue)>2)&&(Te=!0),!Te)return;if(A.altKey&&!Ke){Ke=!0;const oe=[];for(const De of t)be.has(De.id)&&oe.push({...De,id:Es(),timestamp:Date.now()});ee=[...t,...oe]}let he=1/0,$e=1/0,Ae=-1/0,Z=-1/0;for(const[oe,De]of be){const we=M.get(oe);we&&(he=Math.min(he,De.x+B),$e=Math.min($e,De.y+ue),Ae=Math.max(Ae,De.x+B+we.w),Z=Math.max(Z,De.y+ue+we.h))}const Le={x:he,y:$e,width:Ae-he,height:Z-$e},{dx:Ie,dy:ve,guides:U}=Ls(Le,ee,new Set(be.keys()),void 0,N);We(U);const Oe=B+Ie,ge=ue+ve;p=Oe,x=ge,n(ee.map(oe=>{const De=be.get(oe.id);return De?{...oe,x:Math.max(0,De.x+Oe),y:Math.max(0,De.y+ge)}:oe})),gt.current?.(Oe,ge)},V=()=>{window.removeEventListener("mousemove",L),window.removeEventListener("mouseup",V),ce.current=null,_?.(!1),We([]),ut.current?.(p,x,Te)};window.addEventListener("mousemove",L),window.addEventListener("mouseup",V)},[w,t,n,_]),Ot=c.useCallback((C,G,pe)=>{C.preventDefault(),C.stopPropagation();const ie=t.find(M=>M.id===G);if(!ie)return;I(new Set([G])),ce.current="resize",_?.(!0);const me=C.clientX,Be=C.clientY,Ne=ie.width,be=ie.height,Te=ie.x,Ke=ie.y,ee={left:pe.includes("w"),right:pe.includes("e"),top:pe.includes("n"),bottom:pe.includes("s")},p=M=>{const L=M.clientX-me,V=M.clientY-Be;let A=Ne,B=be,ue=Te,he=Ke;pe.includes("e")&&(A=Math.max(bn,Ne+L)),pe.includes("w")&&(A=Math.max(bn,Ne-L),ue=Te+Ne-A),pe.includes("s")&&(B=Math.max(bn,be+V)),pe.includes("n")&&(B=Math.max(bn,be-V),he=Ke+be-B);const $e={x:ue,y:he,width:A,height:B},{dx:Ae,dy:Z,guides:Le}=Ls($e,Re.current,new Set([G]),ee,N);We(Le),Ae!==0&&(ee.right?A+=Ae:ee.left&&(ue+=Ae,A-=Ae)),Z!==0&&(ee.bottom?B+=Z:ee.top&&(he+=Z,B-=Z)),n(Re.current.map(Ie=>Ie.id===G?{...Ie,x:ue,y:he,width:A,height:B}:Ie)),Q({x:M.clientX+12,y:M.clientY+12,text:`${Math.round(A)} × ${Math.round(B)}`})},x=()=>{window.removeEventListener("mousemove",p),window.removeEventListener("mouseup",x),Q(null),ce.current=null,_?.(!1),We([])};window.addEventListener("mousemove",p),window.addEventListener("mouseup",x)},[t,n,_]),Ut=c.useCallback(C=>{ce.current=null,q(G=>{const pe=new Set(G);return pe.add(C),pe}),I(G=>{const pe=new Set(G);return pe.delete(C),pe}),ne(()=>{n(Re.current.filter(G=>G.id!==C)),q(G=>{const pe=new Set(G);return pe.delete(C),pe})},180)},[n]),Qt={hero:"Headline text",button:"Button label",badge:"Badge label",cta:"Call to action text",toast:"Notification message",modal:"Dialog title",card:"Card title",navigation:"Brand / nav items",tabs:"Tab labels",input:"Placeholder text",search:"Search placeholder",pricing:"Plan name or price",testimonial:"Quote text",alert:"Alert message",banner:"Banner text",tag:"Tag label",notification:"Notification message",stat:"Metric value",productCard:"Product name"},yt=c.useCallback(C=>{const G=t.find(pe=>pe.id===C);G&&(xe.current=!!G.text,ye(C),Ue(!1))},[t]),pt=c.useCallback(()=>{Me&&(Ue(!0),ne(()=>{ye(null),Ue(!1)},150))},[Me]);c.useEffect(()=>{i&&Me&&pt()},[i]);const wt=c.useCallback(C=>{Me&&(n(t.map(G=>G.id===Me?{...G,text:C.trim()||void 0}:G)),pt())},[Me,t,n,pt]),$t=typeof window<"u"?window.scrollY:0,Vt=["nw","ne","se","sw"],zt=T?"#f97316":"#3c82f7",qt=[{dir:"n",cls:j.edgeN,arrow:e.jsx("svg",{width:"8",height:"6",viewBox:"0 0 8 6",fill:"none",children:e.jsx("path",{d:"M4 0.5L1 4.5h6z",fill:zt})})},{dir:"e",cls:j.edgeE,arrow:e.jsx("svg",{width:"6",height:"8",viewBox:"0 0 6 8",fill:"none",children:e.jsx("path",{d:"M5.5 4L1.5 1v6z",fill:zt})})},{dir:"s",cls:j.edgeS,arrow:e.jsx("svg",{width:"8",height:"6",viewBox:"0 0 8 6",fill:"none",children:e.jsx("path",{d:"M4 5.5L1 1.5h6z",fill:zt})})},{dir:"w",cls:j.edgeW,arrow:e.jsx("svg",{width:"6",height:"8",viewBox:"0 0 6 8",fill:"none",children:e.jsx("path",{d:"M0.5 4L4.5 1v6z",fill:zt})})}];return e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:P,className:`${j.overlay} ${r?"":j.light} ${o?j.placing:""} ${g?j.passthrough:""} ${i?j.overlayExiting:""} ${T?j.wireframe:""}${y?` ${y}`:""}`,"data-feedback-toolbar":!0,onMouseDown:Xt,children:t.map(C=>{const G=w.has(C.id),pe=Nt[C.type]?.label||C.type,ie=C.y-$t;return e.jsxs("div",{"data-design-placement":C.id,className:`${j.placement} ${G?j.selected:""} ${Se.has(C.id)?j.exiting:""}`,style:{left:C.x,top:ie,width:C.width,height:C.height,position:"fixed"},onMouseDown:me=>Mt(me,C.id),onDoubleClick:()=>yt(C.id),children:[e.jsx("span",{className:j.placementLabel,children:pe}),e.jsx("span",{className:`${j.placementAnnotation} ${C.text?j.annotationVisible:""}`,children:(C.text&&rt.current.set(C.id,C.text),C.text||rt.current.get(C.id)||"")}),e.jsx("div",{className:j.placementContent,children:e.jsx(Il,{type:C.type,width:C.width,height:C.height,text:C.text})}),e.jsx("div",{className:j.deleteButton,onMouseDown:me=>me.stopPropagation(),onClick:()=>Ut(C.id),children:"✕"}),Vt.map(me=>e.jsx("div",{className:`${j.handle} ${j[`handle${me.charAt(0).toUpperCase()}${me.slice(1)}`]}`,onMouseDown:Be=>Ot(Be,C.id,me)},me)),qt.map(({dir:me,cls:Be,arrow:Ne})=>e.jsx("div",{className:`${j.edgeHandle} ${Be}`,onMouseDown:be=>Ot(be,C.id,me),children:Ne},me))]},C.id)})}),Me&&(()=>{const C=t.find(Ke=>Ke.id===Me);if(!C)return null;const G=C.y-$t,pe=C.x+C.width/2,ie=G-8,me=G+C.height+8,Be=ie>200,Ne=me<window.innerHeight-100,be=Math.max(160,Math.min(window.innerWidth-160,pe));let Te;return Be?Te={left:be,bottom:window.innerHeight-ie}:Ne?Te={left:be,top:me}:Te={left:be,top:Math.max(80,window.innerHeight/2-80)},e.jsx(po,{element:Nt[C.type]?.label||C.type,placeholder:Qt[C.type]||"Label or content text",initialValue:C.text??"",submitLabel:xe.current?"Save":"Set",onSubmit:wt,onCancel:pt,onDelete:xe.current?()=>{wt("")}:void 0,isExiting:ze,lightMode:!r,style:Te})})(),X&&e.jsx("div",{className:j.drawBox,style:{left:X.x,top:X.y,width:X.w,height:X.h},"data-feedback-toolbar":!0}),re&&e.jsx("div",{className:j.selectBox,style:{left:re.x,top:re.y,width:re.w,height:re.h},"data-feedback-toolbar":!0}),Xe&&e.jsx("div",{className:j.sizeIndicator,style:{left:Xe.x,top:Xe.y},"data-feedback-toolbar":!0,children:Xe.text}),Ve.map((C,G)=>e.jsx("div",{className:j.guideLine,style:C.axis==="x"?{position:"fixed",left:C.pos,top:0,width:1,bottom:0}:{position:"fixed",left:0,top:C.pos-$t,right:0,height:1},"data-feedback-toolbar":!0},`${C.axis}-${C.pos}-${G}`))]})}function Nl(t){if(!t)return"";const n=t.scrollTop>2,o=t.scrollTop+t.clientHeight<t.scrollHeight-2;return`${n?j.fadeTop:""} ${o?j.fadeBottom:""}`}var a="currentColor",k="0.5";function Bl({type:t}){switch(t){case"navigation":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"4",width:"18",height:"8",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"2.5",y:"7",width:"3",height:"1.5",rx:".5",fill:a,opacity:".4"}),e.jsx("rect",{x:"7",y:"7",width:"2.5",height:"1.5",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"11",y:"7",width:"2.5",height:"1.5",rx:".5",fill:a,opacity:".25"})]});case"header":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3",y:"5.5",width:"8",height:"2",rx:".5",fill:a,opacity:".35"}),e.jsx("rect",{x:"3",y:"9",width:"12",height:"1",rx:".5",fill:a,opacity:".15"})]});case"hero":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"1",width:"18",height:"14",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5",y:"5",width:"10",height:"1.5",rx:".5",fill:a,opacity:".35"}),e.jsx("rect",{x:"7",y:"8",width:"6",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"7.5",y:"10.5",width:"5",height:"2.5",rx:"1",stroke:a,strokeWidth:k})]});case"section":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"1",width:"18",height:"14",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3",y:"4",width:"6",height:"1",rx:".5",fill:a,opacity:".3"}),e.jsx("rect",{x:"3",y:"6.5",width:"14",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"3",y:"9",width:"10",height:"1",rx:".5",fill:a,opacity:".15"})]});case"sidebar":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"1",width:"7",height:"14",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"2.5",y:"4",width:"4",height:"1",rx:".5",fill:a,opacity:".3"}),e.jsx("rect",{x:"2.5",y:"6.5",width:"3.5",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"2.5",y:"9",width:"4",height:"1",rx:".5",fill:a,opacity:".15"})]});case"footer":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"7",width:"18",height:"8",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3",y:"9.5",width:"4",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"9",y:"9.5",width:"4",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"15",y:"9.5",width:"3",height:"1",rx:".5",fill:a,opacity:".2"})]});case"modal":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5",y:"4.5",width:"7",height:"1",rx:".5",fill:a,opacity:".3"}),e.jsx("rect",{x:"5",y:"7",width:"10",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"11",y:"11",width:"5",height:"2",rx:".75",stroke:a,strokeWidth:k})]});case"divider":return e.jsx("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:e.jsx("line",{x1:"2",y1:"8",x2:"18",y2:"8",stroke:a,strokeWidth:"0.5",opacity:".3"})});case"card":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"2",y:"1",width:"16",height:"5.5",rx:"1",fill:a,opacity:".04"}),e.jsx("rect",{x:"4",y:"8.5",width:"8",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"4",y:"11",width:"11",height:"1",rx:".5",fill:a,opacity:".12"})]});case"text":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"4",width:"14",height:"1.5",rx:".5",fill:a,opacity:".3"}),e.jsx("rect",{x:"2",y:"7",width:"11",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"2",y:"9.5",width:"13",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"2",y:"12",width:"8",height:"1",rx:".5",fill:a,opacity:".12"})]});case"image":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("line",{x1:"2",y1:"2",x2:"18",y2:"14",stroke:a,strokeWidth:".3",opacity:".25"}),e.jsx("line",{x1:"18",y1:"2",x2:"2",y2:"14",stroke:a,strokeWidth:".3",opacity:".25"})]});case"video":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("path",{d:"M8.5 5.5v5l4.5-2.5z",stroke:a,strokeWidth:k,fill:a,opacity:".15"})]});case"table":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("line",{x1:"1",y1:"5.5",x2:"19",y2:"5.5",stroke:a,strokeWidth:".3",opacity:".25"}),e.jsx("line",{x1:"1",y1:"9",x2:"19",y2:"9",stroke:a,strokeWidth:".3",opacity:".25"}),e.jsx("line",{x1:"7",y1:"2",x2:"7",y2:"14",stroke:a,strokeWidth:".3",opacity:".25"}),e.jsx("line",{x1:"13",y1:"2",x2:"13",y2:"14",stroke:a,strokeWidth:".3",opacity:".25"})]});case"grid":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1.5",y:"2",width:"7",height:"5.5",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"11.5",y:"2",width:"7",height:"5.5",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"1.5",y:"9.5",width:"7",height:"5.5",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"11.5",y:"9.5",width:"7",height:"5.5",rx:"1",stroke:a,strokeWidth:k})]});case"list":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("circle",{cx:"3.5",cy:"4.5",r:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6.5",y:"4",width:"10",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("circle",{cx:"3.5",cy:"8",r:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6.5",y:"7.5",width:"8",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("circle",{cx:"3.5",cy:"11.5",r:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6.5",y:"11",width:"11",height:"1",rx:".5",fill:a,opacity:".2"})]});case"chart":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"9",width:"2.5",height:"4",rx:".5",fill:a,opacity:".2"}),e.jsx("rect",{x:"7",y:"6",width:"2.5",height:"7",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"11",y:"3",width:"2.5",height:"10",rx:".5",fill:a,opacity:".3"}),e.jsx("rect",{x:"15",y:"5",width:"2.5",height:"8",rx:".5",fill:a,opacity:".2"})]});case"accordion":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1.5",y:"2",width:"17",height:"4",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3",y:"3.5",width:"6",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"1.5",y:"7.5",width:"17",height:"3",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"1.5",y:"12",width:"17",height:"3",rx:"1",stroke:a,strokeWidth:k})]});case"carousel":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"2",width:"14",height:"10",rx:"1",stroke:a,strokeWidth:k}),e.jsx("path",{d:"M1.5 7L3 8.5 1.5 10",stroke:a,strokeWidth:k,opacity:".35"}),e.jsx("path",{d:"M18.5 7L17 8.5 18.5 10",stroke:a,strokeWidth:k,opacity:".35"}),e.jsx("circle",{cx:"8.5",cy:"14",r:".6",fill:a,opacity:".35"}),e.jsx("circle",{cx:"10",cy:"14",r:".6",fill:a,opacity:".15"}),e.jsx("circle",{cx:"11.5",cy:"14",r:".6",fill:a,opacity:".15"})]});case"button":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"5",width:"14",height:"6",rx:"2",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6.5",y:"7.5",width:"7",height:"1",rx:".5",fill:a,opacity:".25"})]});case"input":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"4",width:"5.5",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"2",y:"6.5",width:"16",height:"5.5",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3.5",y:"8.5",width:"7",height:"1",rx:".5",fill:a,opacity:".12"})]});case"search":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"4.5",width:"16",height:"7",rx:"3.5",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"6",cy:"8",r:"2",stroke:a,strokeWidth:k,opacity:".3"}),e.jsx("line",{x1:"7.5",y1:"9.5",x2:"9",y2:"11",stroke:a,strokeWidth:k,opacity:".3"}),e.jsx("rect",{x:"9.5",y:"7.5",width:"6",height:"1",rx:".5",fill:a,opacity:".12"})]});case"form":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"1.5",width:"5.5",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"2",y:"3.5",width:"16",height:"3",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"2",y:"8",width:"7",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"2",y:"10",width:"16",height:"3",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"12",y:"14",width:"6",height:"2",rx:".75",stroke:a,strokeWidth:k})]});case"tabs":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"5",width:"18",height:"10",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"1",y:"2",width:"6",height:"3.5",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"2.5",y:"3.25",width:"3",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"7",y:"2",width:"6",height:"3.5",rx:".75",stroke:a,strokeWidth:k})]});case"dropdown":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"2",width:"16",height:"4",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3.5",y:"3.5",width:"7",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("path",{d:"M15 3.5l1.5 1.5L18 3.5",stroke:a,strokeWidth:k,opacity:".3"}),e.jsx("rect",{x:"2",y:"7",width:"16",height:"7",rx:"1",stroke:a,strokeWidth:k,strokeDasharray:"2 1",opacity:".3"})]});case"toggle":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"4",y:"5",width:"12",height:"6",rx:"3",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"13",cy:"8",r:"2",fill:a,opacity:".3"})]});case"avatar":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("circle",{cx:"10",cy:"8",r:"6",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"10",cy:"6.5",r:"2",stroke:a,strokeWidth:k}),e.jsx("path",{d:"M6.5 13c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5",stroke:a,strokeWidth:k})]});case"badge":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"5",width:"14",height:"6",rx:"3",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6",y:"7.5",width:"8",height:"1",rx:".5",fill:a,opacity:".25"})]});case"breadcrumb":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1.5",y:"7",width:"3.5",height:"1",rx:".5",fill:a,opacity:".3"}),e.jsx("path",{d:"M6.5 7l1 1-1 1",stroke:a,strokeWidth:k,opacity:".2"}),e.jsx("rect",{x:"9",y:"7",width:"3.5",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("path",{d:"M14 7l1 1-1 1",stroke:a,strokeWidth:k,opacity:".2"}),e.jsx("rect",{x:"16.5",y:"7",width:"2",height:"1",rx:".5",fill:a,opacity:".15"})]});case"pagination":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6.5",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"11",y:"5.5",width:"3.5",height:"5",rx:"1",fill:a,opacity:".15",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"15.5",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:a,strokeWidth:k})]});case"progress":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"7",width:"16",height:"2",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"2",y:"7",width:"10",height:"2",rx:"1",fill:a,opacity:".2"})]});case"toast":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"4",width:"16",height:"8",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"5",cy:"8",r:"1.5",stroke:a,strokeWidth:k,opacity:".3"}),e.jsx("rect",{x:"8",y:"6.5",width:"7",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"8",y:"9",width:"5",height:"1",rx:".5",fill:a,opacity:".12"})]});case"tooltip":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"3",width:"14",height:"7",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5.5",y:"5.5",width:"9",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("path",{d:"M9 10l1 2.5 1-2.5",stroke:a,strokeWidth:k})]});case"pricing":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6",y:"3",width:"8",height:"1.5",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"7",y:"5.5",width:"6",height:"2",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"5",y:"9",width:"10",height:"1",rx:".5",fill:a,opacity:".1"}),e.jsx("rect",{x:"5",y:"11",width:"10",height:"1",rx:".5",fill:a,opacity:".1"}),e.jsx("rect",{x:"6",y:"13",width:"8",height:"1.5",rx:".5",fill:a,opacity:".2"})]});case"testimonial":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("text",{x:"4",y:"5.5",fontSize:"4",fill:a,opacity:".2",fontFamily:"serif",children:"“"}),e.jsx("rect",{x:"4",y:"7",width:"12",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"4",y:"9",width:"9",height:"1",rx:".5",fill:a,opacity:".12"}),e.jsx("circle",{cx:"5.5",cy:"12.5",r:"1.5",stroke:a,strokeWidth:k,opacity:".25"}),e.jsx("rect",{x:"8",y:"12",width:"5",height:"1",rx:".5",fill:a,opacity:".15"})]});case"cta":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5",y:"4.5",width:"10",height:"1.5",rx:".5",fill:a,opacity:".3"}),e.jsx("rect",{x:"6",y:"7.5",width:"8",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"7",y:"10",width:"6",height:"2.5",rx:"1",stroke:a,strokeWidth:k})]});case"alert":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"4",width:"16",height:"8",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"6",cy:"8",r:"2",stroke:a,strokeWidth:k,opacity:".3"}),e.jsx("line",{x1:"6",y1:"7",x2:"6",y2:"8.5",stroke:a,strokeWidth:"0.6",opacity:".5"}),e.jsx("circle",{cx:"6",cy:"9.3",r:".3",fill:a,opacity:".5"}),e.jsx("rect",{x:"9.5",y:"7",width:"6",height:"1",rx:".5",fill:a,opacity:".2"})]});case"banner":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1",y:"5",width:"18",height:"6",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"4",y:"7.5",width:"8",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"14",y:"7",width:"3.5",height:"2",rx:".75",stroke:a,strokeWidth:k})]});case"stat":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6",y:"4.5",width:"8",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"5",y:"7",width:"10",height:"2.5",rx:".5",fill:a,opacity:".3"}),e.jsx("rect",{x:"7",y:"11",width:"6",height:"1",rx:".5",fill:a,opacity:".12"})]});case"stepper":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("circle",{cx:"4",cy:"8",r:"2",fill:a,opacity:".2",stroke:a,strokeWidth:k}),e.jsx("line",{x1:"6",y1:"8",x2:"8",y2:"8",stroke:a,strokeWidth:".4",opacity:".3"}),e.jsx("circle",{cx:"10",cy:"8",r:"2",stroke:a,strokeWidth:k}),e.jsx("line",{x1:"12",y1:"8",x2:"14",y2:"8",stroke:a,strokeWidth:".4",opacity:".3"}),e.jsx("circle",{cx:"16",cy:"8",r:"2",stroke:a,strokeWidth:k})]});case"tag":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"5",width:"14",height:"6",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5.5",y:"7.5",width:"6",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("line",{x1:"14",y1:"6.5",x2:"15.5",y2:"9.5",stroke:a,strokeWidth:k,opacity:".2"}),e.jsx("line",{x1:"15.5",y1:"6.5",x2:"14",y2:"9.5",stroke:a,strokeWidth:k,opacity:".2"})]});case"rating":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("path",{d:"M4 5.5l1 2 2.2.3-1.6 1.5.4 2.2L4 10.3l-2 1.2.4-2.2L.8 7.8 3 7.5z",fill:a,opacity:".25"}),e.jsx("path",{d:"M10 5.5l1 2 2.2.3-1.6 1.5.4 2.2L10 10.3l-2 1.2.4-2.2L6.8 7.8 9 7.5z",fill:a,opacity:".25"}),e.jsx("path",{d:"M16 5.5l1 2 2.2.3-1.6 1.5.4 2.2L16 10.3l-2 1.2.4-2.2-1.6-1.5 2.2-.3z",stroke:a,strokeWidth:k,opacity:".25"})]});case"map":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("line",{x1:"2",y1:"6",x2:"18",y2:"10",stroke:a,strokeWidth:".3",opacity:".15"}),e.jsx("line",{x1:"7",y1:"2",x2:"11",y2:"14",stroke:a,strokeWidth:".3",opacity:".15"}),e.jsx("path",{d:"M10 5c-1.7 0-3 1.3-3 3 0 2.5 3 5 3 5s3-2.5 3-5c0-1.7-1.3-3-3-3z",fill:a,opacity:".15",stroke:a,strokeWidth:k})]});case"timeline":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("line",{x1:"5",y1:"2",x2:"5",y2:"14",stroke:a,strokeWidth:".4",opacity:".25"}),e.jsx("circle",{cx:"5",cy:"4",r:"1.5",fill:a,opacity:".2",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"8",y:"3",width:"8",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("circle",{cx:"5",cy:"8.5",r:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"8",y:"7.5",width:"6",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("circle",{cx:"5",cy:"13",r:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"8",y:"12",width:"7",height:"1",rx:".5",fill:a,opacity:".15"})]});case"fileUpload":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:a,strokeWidth:k,strokeDasharray:"2 1"}),e.jsx("path",{d:"M10 10V5.5m0 0L7.5 8m2.5-2.5L12.5 8",stroke:a,strokeWidth:k,opacity:".3"}),e.jsx("rect",{x:"7",y:"11.5",width:"6",height:"1",rx:".5",fill:a,opacity:".15"})]});case"codeBlock":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"4",cy:"4",r:".6",fill:a,opacity:".3"}),e.jsx("circle",{cx:"5.5",cy:"4",r:".6",fill:a,opacity:".3"}),e.jsx("circle",{cx:"7",cy:"4",r:".6",fill:a,opacity:".3"}),e.jsx("rect",{x:"4",y:"7",width:"7",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("rect",{x:"6",y:"9",width:"5",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"4",y:"11",width:"8",height:"1",rx:".5",fill:a,opacity:".12"})]});case"calendar":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"3",width:"16",height:"12",rx:"1",stroke:a,strokeWidth:k}),e.jsx("line",{x1:"2",y1:"6.5",x2:"18",y2:"6.5",stroke:a,strokeWidth:".4",opacity:".25"}),e.jsx("rect",{x:"5",y:"4",width:"1",height:"1.5",rx:".3",fill:a,opacity:".2"}),e.jsx("rect",{x:"14",y:"4",width:"1",height:"1.5",rx:".3",fill:a,opacity:".2"}),e.jsx("circle",{cx:"7",cy:"9",r:".6",fill:a,opacity:".2"}),e.jsx("circle",{cx:"10",cy:"9",r:".6",fill:a,opacity:".2"}),e.jsx("circle",{cx:"13",cy:"9",r:".6",fill:a,opacity:".3"}),e.jsx("circle",{cx:"7",cy:"12",r:".6",fill:a,opacity:".2"}),e.jsx("circle",{cx:"10",cy:"12",r:".6",fill:a,opacity:".2"})]});case"notification":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"3",width:"16",height:"10",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"5.5",cy:"8",r:"2",stroke:a,strokeWidth:k,opacity:".25"}),e.jsx("rect",{x:"9",y:"6",width:"6",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"9",y:"8.5",width:"4.5",height:"1",rx:".5",fill:a,opacity:".12"}),e.jsx("circle",{cx:"16.5",cy:"4.5",r:"1.5",fill:a,opacity:".25"})]});case"productCard":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"1",width:"14",height:"14",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3",y:"1",width:"14",height:"6",rx:"1",fill:a,opacity:".04"}),e.jsx("rect",{x:"5",y:"8.5",width:"7",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"5",y:"10.5",width:"4",height:"1.5",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"12",y:"12",width:"4",height:"2",rx:".75",stroke:a,strokeWidth:k})]});case"profile":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("circle",{cx:"10",cy:"5",r:"3",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5",y:"10",width:"10",height:"1.5",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"7",y:"12.5",width:"6",height:"1",rx:".5",fill:a,opacity:".12"})]});case"drawer":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"9",y:"1",width:"10",height:"14",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"10.5",y:"4",width:"5",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"10.5",y:"6.5",width:"7",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"10.5",y:"9",width:"6",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"1",y:"1",width:"7",height:"14",rx:"1",stroke:a,strokeWidth:k,opacity:".15"})]});case"popover":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"2",width:"14",height:"9",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5",y:"4.5",width:"8",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"5",y:"7",width:"6",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("path",{d:"M9 11l1 2.5 1-2.5",stroke:a,strokeWidth:k})]});case"logo":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"3",width:"10",height:"10",rx:"2",stroke:a,strokeWidth:k}),e.jsx("path",{d:"M5 9.5l2-4 2 4",stroke:a,strokeWidth:k,opacity:".3"}),e.jsx("rect",{x:"14",y:"6",width:"4",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("rect",{x:"14",y:"8.5",width:"3",height:"1",rx:".5",fill:a,opacity:".12"})]});case"faq":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("text",{x:"2.5",y:"5.5",fontSize:"4",fill:a,opacity:".3",fontWeight:"bold",children:"?"}),e.jsx("rect",{x:"7",y:"3",width:"10",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"7",y:"5.5",width:"8",height:"1",rx:".5",fill:a,opacity:".12"}),e.jsx("text",{x:"2.5",y:"11.5",fontSize:"4",fill:a,opacity:".3",fontWeight:"bold",children:"?"}),e.jsx("rect",{x:"7",y:"9",width:"9",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"7",y:"11.5",width:"7",height:"1",rx:".5",fill:a,opacity:".12"})]});case"gallery":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"7.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"13.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"1.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"7.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"13.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:a,strokeWidth:k})]});case"checkbox":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"5",y:"4",width:"8",height:"8",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("path",{d:"M7.5 8l1.5 1.5 3-3",stroke:a,strokeWidth:k,opacity:".35"})]});case"radio":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("circle",{cx:"10",cy:"8",r:"4",stroke:a,strokeWidth:k}),e.jsx("circle",{cx:"10",cy:"8",r:"2",fill:a,opacity:".3"})]});case"slider":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"7.5",width:"16",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"2",y:"7.5",width:"10",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("circle",{cx:"12",cy:"8",r:"2.5",stroke:a,strokeWidth:k})]});case"datePicker":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"1",width:"16",height:"5",rx:"1",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"3.5",y:"3",width:"5",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("rect",{x:"14",y:"2.5",width:"2.5",height:"2",rx:".5",fill:a,opacity:".12"}),e.jsx("rect",{x:"2",y:"7",width:"16",height:"8",rx:"1",stroke:a,strokeWidth:k,strokeDasharray:"2 1",opacity:".3"}),e.jsx("circle",{cx:"6",cy:"10",r:".6",fill:a,opacity:".2"}),e.jsx("circle",{cx:"10",cy:"10",r:".6",fill:a,opacity:".3"}),e.jsx("circle",{cx:"14",cy:"10",r:".6",fill:a,opacity:".2"}),e.jsx("circle",{cx:"6",cy:"13",r:".6",fill:a,opacity:".2"}),e.jsx("circle",{cx:"10",cy:"13",r:".6",fill:a,opacity:".2"})]});case"skeleton":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"2",width:"16",height:"3",rx:"1",fill:a,opacity:".08"}),e.jsx("rect",{x:"2",y:"7",width:"10",height:"2",rx:".75",fill:a,opacity:".08"}),e.jsx("rect",{x:"2",y:"11",width:"13",height:"2",rx:".75",fill:a,opacity:".08"})]});case"chip":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"1.5",y:"5",width:"10",height:"6",rx:"3",fill:a,opacity:".08",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"4",y:"7.5",width:"4",height:"1",rx:".5",fill:a,opacity:".25"}),e.jsx("line",{x1:"9.5",y1:"6.5",x2:"10.5",y2:"9.5",stroke:a,strokeWidth:k,opacity:".2"}),e.jsx("line",{x1:"10.5",y1:"6.5",x2:"9.5",y2:"9.5",stroke:a,strokeWidth:k,opacity:".2"}),e.jsx("rect",{x:"13",y:"5",width:"5.5",height:"6",rx:"3",stroke:a,strokeWidth:k,opacity:".25"})]});case"icon":return e.jsx("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:e.jsx("path",{d:"M10 3l1.5 3 3.5.5-2.5 2.5.5 3.5L10 11l-3 1.5.5-3.5L5 6.5l3.5-.5z",stroke:a,strokeWidth:k,opacity:".3"})});case"spinner":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("circle",{cx:"10",cy:"8",r:"5",stroke:a,strokeWidth:k,opacity:".12"}),e.jsx("path",{d:"M10 3a5 5 0 0 1 5 5",stroke:a,strokeWidth:k,opacity:".35",strokeLinecap:"round"})]});case"feature":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"2",width:"5",height:"5",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("path",{d:"M4.5 3.5v3m-1.5-1.5h3",stroke:a,strokeWidth:k,opacity:".25"}),e.jsx("rect",{x:"9",y:"2.5",width:"8",height:"1.5",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"9",y:"5.5",width:"6",height:"1",rx:".5",fill:a,opacity:".12"}),e.jsx("rect",{x:"2",y:"10",width:"5",height:"5",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"9",y:"10.5",width:"7",height:"1.5",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"9",y:"13.5",width:"5",height:"1",rx:".5",fill:a,opacity:".12"})]});case"team":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("circle",{cx:"5",cy:"5",r:"2.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"2.5",y:"9",width:"5",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("circle",{cx:"15",cy:"5",r:"2.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"12.5",y:"9",width:"5",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("circle",{cx:"10",cy:"5",r:"2.5",stroke:a,strokeWidth:k,opacity:".5"}),e.jsx("rect",{x:"7.5",y:"9",width:"5",height:"1",rx:".5",fill:a,opacity:".15"}),e.jsx("rect",{x:"4",y:"12",width:"12",height:"1",rx:".5",fill:a,opacity:".1"})]});case"login":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"3",y:"1",width:"14",height:"14",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6",y:"3",width:"8",height:"1.5",rx:".5",fill:a,opacity:".25"}),e.jsx("rect",{x:"5",y:"5.5",width:"10",height:"3",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"5",y:"9.5",width:"10",height:"3",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"6.5",y:"13.5",width:"7",height:"2",rx:".75",fill:a,opacity:".2"})]});case"contact":return e.jsxs("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[e.jsx("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"4",y:"3",width:"5",height:"1",rx:".5",fill:a,opacity:".2"}),e.jsx("rect",{x:"4",y:"5",width:"12",height:"2.5",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"4",y:"8.5",width:"12",height:"4",rx:".75",stroke:a,strokeWidth:k}),e.jsx("rect",{x:"11",y:"13.5",width:"5",height:"1.5",rx:".5",fill:a,opacity:".2"})]});default:return null}}function Tl({activeType:t,onSelect:n,onDragStart:o,scrollRef:s,fadeClass:r,blankCanvas:i}){return e.jsx("div",{ref:s,className:`${j.placeScroll} ${r||""}`,children:nr.map(_=>e.jsxs("div",{className:j.paletteSection,children:[e.jsx("div",{className:j.paletteSectionTitle,children:_.section}),_.items.map(y=>e.jsxs("div",{className:`${j.paletteItem} ${t===y.type?j.active:""} ${i?j.wireframe:""}`,onClick:()=>n(y.type),onMouseDown:g=>{g.button===0&&o(y.type,g)},children:[e.jsx("div",{className:j.paletteItemIcon,children:e.jsx(Bl,{type:y.type})}),e.jsx("span",{className:j.paletteItemLabel,children:y.label})]},y.type))]},_.section))})}function Dl({value:t,suffix:n}){const[o,s]=c.useState(null),[r,i]=c.useState(n),[_,y]=c.useState("up"),g=c.useRef(t),N=c.useRef(n),f=c.useRef(),R=o!==null&&r!==n;return c.useEffect(()=>{if(t!==g.current){if(t===0){g.current=t,N.current=n,s(null);return}y(t>g.current?"up":"down"),s(g.current),i(N.current),g.current=t,N.current=n,clearTimeout(f.current),f.current=ne(()=>s(null),250)}else N.current=n},[t,n]),o===null?e.jsxs(e.Fragment,{children:[t,n?` ${n}`:""]}):R?e.jsxs("span",{className:j.rollingWrap,children:[e.jsxs("span",{style:{visibility:"hidden"},children:[t," ",n]}),e.jsxs("span",{className:`${j.rollingNum} ${_==="up"?j.exitUp:j.exitDown}`,children:[o," ",r]},`o${o}-${t}`),e.jsxs("span",{className:`${j.rollingNum} ${_==="up"?j.enterUp:j.enterDown}`,children:[t," ",n]},`n${t}`)]}):e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:j.rollingWrap,children:[e.jsx("span",{style:{visibility:"hidden"},children:t}),e.jsx("span",{className:`${j.rollingNum} ${_==="up"?j.exitUp:j.exitDown}`,children:o},`o${o}-${t}`),e.jsx("span",{className:`${j.rollingNum} ${_==="up"?j.enterUp:j.enterDown}`,children:t},`n${t}`)]}),n?` ${n}`:""]})}function Pl({activeType:t,onSelect:n,isDarkMode:o,sectionCount:s,onDetectSections:r,visible:i,onExited:_,placementCount:y,onClearPlacements:g,onDragStart:N,blankCanvas:f,onBlankCanvasChange:R,wireframePurpose:b,onWireframePurposeChange:z,Tooltip:v}){const[T,w]=c.useState(!1),[I,X]=c.useState("exit"),[ae,re]=c.useState(!1),[Ye,Xe]=c.useState(!0),Q=c.useRef(0),Ve=c.useRef(""),We=c.useRef(0),Me=c.useRef(),ye=c.useRef(null),[ze,Ue]=c.useState("");c.useEffect(()=>(i?(w(!0),clearTimeout(Me.current),cancelAnimationFrame(We.current),We.current=kn(()=>{We.current=kn(()=>{X("enter")})})):(cancelAnimationFrame(We.current),X("exit"),clearTimeout(Me.current),Me.current=ne(()=>{w(!1),_?.()},200)),()=>cancelAnimationFrame(We.current)),[i]);const xe=y>0||s>0,Se=y+s;return Se>0&&(Q.current=Se,Ve.current=f?Se===1?"Component":"Components":Se===1?"Change":"Changes"),c.useEffect(()=>{if(xe)ae?Xe(!1):(Xe(!0),re(!0),kn(()=>{kn(()=>{Xe(!1)})}));else{Xe(!0);const q=ne(()=>re(!1),300);return()=>clearTimeout(q)}},[xe]),c.useEffect(()=>{if(!T)return;const q=ye.current;if(!q)return;const rt=()=>Ue(Nl(q));rt(),q.addEventListener("scroll",rt,{passive:!0});const P=new ResizeObserver(rt);return P.observe(q),()=>{q.removeEventListener("scroll",rt),P.disconnect()}},[T]),T?e.jsxs("div",{className:`${j.palette} ${j[I]} ${o?"":j.light}`,"data-feedback-toolbar":!0,"data-agentation-palette":!0,onClick:q=>q.stopPropagation(),onMouseDown:q=>q.stopPropagation(),onTransitionEnd:q=>{q.target===q.currentTarget&&(i||(clearTimeout(Me.current),w(!1),X("exit"),_?.()))},children:[e.jsxs("div",{className:j.paletteHeader,children:[e.jsx("div",{className:j.paletteHeaderTitle,children:"Layout Mode"}),e.jsxs("div",{className:j.paletteHeaderDesc,children:["Rearrange and resize existing elements, add new components, and explore layout ideas. Agent results may vary."," ",e.jsx("a",{href:"https://agentation.dev/features#layout-mode",target:"_blank",rel:"noopener noreferrer",children:"Learn more."})]})]}),e.jsxs("div",{className:`${j.canvasToggle} ${f?j.active:""}`,onClick:()=>R(!f),children:[e.jsx("span",{className:j.canvasToggleIcon,children:e.jsxs("svg",{viewBox:"0 0 14 14",width:"14",height:"14",fill:"none",children:[e.jsx("rect",{x:"1",y:"1",width:"12",height:"12",rx:"2",stroke:"currentColor",strokeWidth:"1"}),e.jsx("circle",{cx:"4.5",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"7",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"9.5",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"4.5",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"7",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"9.5",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"4.5",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"7",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"}),e.jsx("circle",{cx:"9.5",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"})]})}),e.jsx("span",{className:j.canvasToggleLabel,children:"Wireframe New Page"})]}),e.jsx("div",{className:`${j.wireframePurposeWrap} ${f?"":j.collapsed}`,children:e.jsx("div",{className:j.wireframePurposeInner,children:e.jsx("textarea",{className:j.wireframePurposeInput,placeholder:"Describe this page to provide additional context for your agent.",value:b,onChange:q=>z(q.target.value),rows:2})})}),e.jsx(Tl,{activeType:t,onSelect:n,onDragStart:N,scrollRef:ye,fadeClass:ze,blankCanvas:f}),ae&&e.jsx("div",{className:`${j.paletteFooterWrap} ${Ye?j.footerHidden:""}`,children:e.jsx("div",{className:j.paletteFooterInner,children:e.jsx("div",{className:j.paletteFooterInnerContent,children:e.jsxs("div",{className:j.paletteFooter,children:[e.jsx("span",{className:j.paletteFooterCount,children:e.jsx(Dl,{value:Q.current,suffix:Ve.current})}),e.jsx("button",{className:j.paletteFooterClear,onClick:g,children:"Clear"})]})})})})]}):null}function Cn(t){if(t.parentElement)return t.parentElement;const n=t.getRootNode();return n instanceof ShadowRoot?n.host:null}function ht(t,n){let o=t;for(;o;){if(o.matches(n))return o;o=Cn(o)}return null}function Ic(t){return t.getRootNode()instanceof ShadowRoot}function Lc(t){const n=t.getRootNode();return n instanceof ShadowRoot?n.host:null}function Wl(t,n=4){const o=[];let s=t,r=0;for(;s&&r<n;){const i=s.tagName.toLowerCase();if(i==="html"||i==="body")break;let _=i;if(s.id)_=`#${s.id}`;else if(s.className&&typeof s.className=="string"){const g=s.className.split(/\s+/).find(N=>N.length>2&&!N.match(/^[a-z]{1,2}$/)&&!N.match(/[A-Z0-9]{5,}/));g&&(_=`.${g.split("_")[0]}`)}const y=Cn(s);!s.parentElement&&y&&(_=`⟨shadow⟩ ${_}`),o.unshift(_),s=y,r++}return o.join(" > ")}function jn(t){const n=Wl(t);if(t.dataset.element)return{name:t.dataset.element,path:n};const o=t.tagName.toLowerCase();if(["path","circle","rect","line","g"].includes(o)){const s=ht(t,"svg");if(s){const r=Cn(s);if(r instanceof HTMLElement)return{name:`graphic in ${jn(r).name}`,path:n}}return{name:"graphic element",path:n}}if(o==="svg"){const s=Cn(t);if(s?.tagName.toLowerCase()==="button"){const r=s.textContent?.trim();return{name:r?`icon in "${r}" button`:"button icon",path:n}}return{name:"icon",path:n}}if(o==="button"){const s=t.textContent?.trim(),r=t.getAttribute("aria-label");return r?{name:`button [${r}]`,path:n}:{name:s?`button "${s.slice(0,25)}"`:"button",path:n}}if(o==="a"){const s=t.textContent?.trim(),r=t.getAttribute("href");return s?{name:`link "${s.slice(0,25)}"`,path:n}:r?{name:`link to ${r.slice(0,30)}`,path:n}:{name:"link",path:n}}if(o==="input"){const s=t.getAttribute("type")||"text",r=t.getAttribute("placeholder"),i=t.getAttribute("name");return r?{name:`input "${r}"`,path:n}:i?{name:`input [${i}]`,path:n}:{name:`${s} input`,path:n}}if(["h1","h2","h3","h4","h5","h6"].includes(o)){const s=t.textContent?.trim();return{name:s?`${o} "${s.slice(0,35)}"`:o,path:n}}if(o==="p"){const s=t.textContent?.trim();return s?{name:`paragraph: "${s.slice(0,40)}${s.length>40?"...":""}"`,path:n}:{name:"paragraph",path:n}}if(o==="span"||o==="label"){const s=t.textContent?.trim();return s&&s.length<40?{name:`"${s}"`,path:n}:{name:o,path:n}}if(o==="li"){const s=t.textContent?.trim();return s&&s.length<40?{name:`list item: "${s.slice(0,35)}"`,path:n}:{name:"list item",path:n}}if(o==="blockquote")return{name:"blockquote",path:n};if(o==="code"){const s=t.textContent?.trim();return s&&s.length<30?{name:`code: \`${s}\``,path:n}:{name:"code",path:n}}if(o==="pre")return{name:"code block",path:n};if(o==="img"){const s=t.getAttribute("alt");return{name:s?`image "${s.slice(0,30)}"`:"image",path:n}}if(o==="video")return{name:"video",path:n};if(["div","section","article","nav","header","footer","aside","main"].includes(o)){const s=t.className,r=t.getAttribute("role"),i=t.getAttribute("aria-label");if(i)return{name:`${o} [${i}]`,path:n};if(r)return{name:`${r}`,path:n};if(typeof s=="string"&&s){const _=s.split(/[\s_-]+/).map(y=>y.replace(/[A-Z0-9]{5,}.*$/,"")).filter(y=>y.length>2&&!/^[a-z]{1,2}$/.test(y)).slice(0,2);if(_.length>0)return{name:_.join(" "),path:n}}return{name:o==="div"?"container":o,path:n}}return{name:o,path:n}}function Pn(t){const n=[],o=t.textContent?.trim();o&&o.length<100&&n.push(o);const s=t.previousElementSibling;if(s){const i=s.textContent?.trim();i&&i.length<50&&n.unshift(`[before: "${i.slice(0,40)}"]`)}const r=t.nextElementSibling;if(r){const i=r.textContent?.trim();i&&i.length<50&&n.push(`[after: "${i.slice(0,40)}"]`)}return n.join(" ")}function Ec(t){if(t.dataset.element)return t.dataset.element;const n=t.tagName.toLowerCase();if(n==="path")return"path";if(n==="circle")return"circle";if(n==="rect")return"rectangle";if(n==="line")return"line";if(n==="ellipse")return"ellipse";if(n==="polygon")return"polygon";if(n==="g")return"group";if(n==="svg")return"svg";if(n==="button"){const o=t.textContent?.trim();return o?`button "${o}"`:"button"}if(n==="input")return`input (${t.getAttribute("type")||"text"})`;if(n==="span"||n==="p"||n==="label"){const o=t.textContent?.trim();return o&&o.length<30?`"${o}"`:"text"}if(n==="div"){const o=t.className;if(typeof o=="string"&&o){const s=o.split(/[\s_-]+/).map(r=>r.replace(/[A-Z0-9]{5,}.*$/,"")).filter(r=>r.length>2&&!/^[a-z]{1,2}$/.test(r)).slice(0,2);if(s.length>0)return s.join(" ")}return"container"}return n}function so(t){const n=Cn(t);if(!n)return"";const r=(t.getRootNode()instanceof ShadowRoot&&t.parentElement?Array.from(t.parentElement.children):Array.from(n.children)).filter(f=>f!==t&&f instanceof HTMLElement);if(r.length===0)return"";const i=r.slice(0,4).map(f=>{const R=f.tagName.toLowerCase(),b=f.className;let z="";if(typeof b=="string"&&b){const v=b.split(/\s+/).map(T=>T.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(T=>T.length>2&&!/^[a-z]{1,2}$/.test(T));v&&(z=`.${v}`)}if(R==="button"||R==="a"){const v=f.textContent?.trim().slice(0,15);if(v)return`${R}${z} "${v}"`}return`${R}${z}`});let y=n.tagName.toLowerCase();if(typeof n.className=="string"&&n.className){const f=n.className.split(/\s+/).map(R=>R.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(R=>R.length>2&&!/^[a-z]{1,2}$/.test(R));f&&(y=`.${f}`)}const g=n.children.length,N=g>i.length+1?` (${g} total in ${y})`:"";return i.join(", ")+N}function Wn(t){const n=t.className;return typeof n!="string"||!n?"":n.split(/\s+/).filter(s=>s.length>0).map(s=>{const r=s.match(/^([a-zA-Z][a-zA-Z0-9_-]*?)(?:_[a-zA-Z0-9]{5,})?$/);return r?r[1]:s}).filter((s,r,i)=>i.indexOf(s)===r).join(", ")}var or=new Set(["none","normal","auto","0px","rgba(0, 0, 0, 0)","transparent","static","visible"]),Al=new Set(["p","span","h1","h2","h3","h4","h5","h6","label","li","td","th","blockquote","figcaption","caption","legend","dt","dd","pre","code","em","strong","b","i","a","time","cite","q"]),Ol=new Set(["input","textarea","select"]),zl=new Set(["img","video","canvas","svg"]),Fl=new Set(["div","section","article","nav","header","footer","aside","main","ul","ol","form","fieldset"]);function ro(t){if(typeof window>"u")return{};const n=window.getComputedStyle(t),o={},s=t.tagName.toLowerCase();let r;Al.has(s)?r=["color","fontSize","fontWeight","fontFamily","lineHeight"]:s==="button"||s==="a"&&t.getAttribute("role")==="button"?r=["backgroundColor","color","padding","borderRadius","fontSize"]:Ol.has(s)?r=["backgroundColor","color","padding","borderRadius","fontSize"]:zl.has(s)?r=["width","height","objectFit","borderRadius"]:Fl.has(s)?r=["display","padding","margin","gap","backgroundColor"]:r=["color","fontSize","margin","padding","backgroundColor"];for(const i of r){const _=i.replace(/([A-Z])/g,"-$1").toLowerCase(),y=n.getPropertyValue(_);y&&!or.has(y)&&(o[i]=y)}return o}var Hl=["color","backgroundColor","borderColor","fontSize","fontWeight","fontFamily","lineHeight","letterSpacing","textAlign","width","height","padding","margin","border","borderRadius","display","position","top","right","bottom","left","zIndex","flexDirection","justifyContent","alignItems","gap","opacity","visibility","overflow","boxShadow","transform"];function io(t){if(typeof window>"u")return"";const n=window.getComputedStyle(t),o=[];for(const s of Hl){const r=s.replace(/([A-Z])/g,"-$1").toLowerCase(),i=n.getPropertyValue(r);i&&!or.has(i)&&o.push(`${r}: ${i}`)}return o.join("; ")}function Yl(t){if(!t)return;const n={},o=t.split(";").map(s=>s.trim()).filter(Boolean);for(const s of o){const r=s.indexOf(":");if(r>0){const i=s.slice(0,r).trim(),_=s.slice(r+1).trim();i&&_&&(n[i]=_)}}return Object.keys(n).length>0?n:void 0}function lo(t){const n=[],o=t.getAttribute("role"),s=t.getAttribute("aria-label"),r=t.getAttribute("aria-describedby"),i=t.getAttribute("tabindex"),_=t.getAttribute("aria-hidden");return o&&n.push(`role="${o}"`),s&&n.push(`aria-label="${s}"`),r&&n.push(`aria-describedby="${r}"`),i&&n.push(`tabindex=${i}`),_==="true"&&n.push("aria-hidden"),t.matches("a, button, input, select, textarea, [tabindex]")&&n.push("focusable"),n.join(", ")}function ao(t){const n=[];let o=t;for(;o&&o.tagName.toLowerCase()!=="html";){const s=o.tagName.toLowerCase();let r=s;if(o.id)r=`${s}#${o.id}`;else if(o.className&&typeof o.className=="string"){const _=o.className.split(/\s+/).map(y=>y.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(y=>y.length>2);_&&(r=`${s}.${_}`)}const i=Cn(o);!o.parentElement&&i&&(r=`⟨shadow⟩ ${r}`),n.unshift(r),o=i}return n.join(" > ")}var Xl=new Set(["nav","header","main","section","article","footer","aside"]),Vo={banner:"Header",navigation:"Navigation",main:"Main Content",contentinfo:"Footer",complementary:"Sidebar",region:"Section"},Rs={nav:"Navigation",header:"Header",main:"Main Content",section:"Section",article:"Article",footer:"Footer",aside:"Sidebar"},Ul=new Set(["script","style","noscript","link","meta"]),Ql=40;function sr(t){let n=t;for(;n&&n!==document.body&&n!==document.documentElement;){const o=window.getComputedStyle(n).position;if(o==="fixed"||o==="sticky")return!0;n=n.parentElement}return!1}function _n(t){const n=t.tagName.toLowerCase();if(["nav","header","footer","main"].includes(n)&&document.querySelectorAll(n).length===1)return n;if(t.id)return`#${CSS.escape(t.id)}`;if(t.className&&typeof t.className=="string"){const r=t.className.split(/\s+/).filter(i=>i.length>0).find(i=>i.length>2&&!/^[a-zA-Z0-9]{6,}$/.test(i)&&!/^[a-z]{1,2}$/.test(i));if(r){const i=`${n}.${CSS.escape(r)}`;if(document.querySelectorAll(i).length===1)return i}}const o=t.parentElement;if(o){const r=Array.from(o.children).indexOf(t)+1;return`${o===document.body?"body":_n(o)} > ${n}:nth-child(${r})`}return n}function fo(t){const n=t.tagName.toLowerCase(),o=t.getAttribute("aria-label");if(o)return o;const s=t.getAttribute("role");if(s&&Vo[s])return Vo[s];if(Rs[n])return Rs[n];const r=t.querySelector("h1, h2, h3, h4, h5, h6");if(r){const _=r.textContent?.trim();if(_&&_.length<=50)return _;if(_)return _.slice(0,47)+"..."}const{name:i}=jn(t);return i.charAt(0).toUpperCase()+i.slice(1)}function rr(t){const n=t.className;return typeof n!="string"||!n?null:n.split(/\s+/).map(s=>s.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(s=>s.length>2&&!/^[a-z]{1,2}$/.test(s))||null}function ir(t){const n=t.textContent?.trim();if(!n)return null;const o=n.replace(/\s+/g," ");return o.length<=30?o:o.slice(0,30)+"…"}function Vl(){const t=document.querySelector("main")||document.body,n=Array.from(t.children);let o=n;t!==document.body&&n.length<3&&(o=Array.from(document.body.children));const s=[];return o.forEach((r,i)=>{if(!(r instanceof HTMLElement))return;const _=r.tagName.toLowerCase();if(Ul.has(_)||r.hasAttribute("data-feedback-toolbar")||r.closest("[data-feedback-toolbar]"))return;const y=window.getComputedStyle(r);if(y.display==="none"||y.visibility==="hidden")return;const g=r.getBoundingClientRect();if(g.height<Ql)return;const N=Xl.has(_),f=r.getAttribute("role")&&Vo[r.getAttribute("role")],R=_==="div"&&g.height>=60;if(!N&&!f&&!R)return;const b=window.scrollY,z=sr(r),v={x:g.x,y:z?g.y:g.y+b,width:g.width,height:g.height};s.push({id:`rs-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,label:fo(r),tagName:_,selector:_n(r),role:r.getAttribute("role"),className:rr(r),textSnippet:ir(r),originalRect:v,currentRect:{...v},originalIndex:i,isFixed:z})}),s}function ql(t){const n=window.scrollY,o=t.getBoundingClientRect(),s=sr(t),r={x:o.x,y:s?o.y:o.y+n,width:o.width,height:o.height},i=t.parentElement;let _=0;return i&&(_=Array.from(i.children).indexOf(t)),{id:`rs-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,label:fo(t),tagName:t.tagName.toLowerCase(),selector:_n(t),role:t.getAttribute("role"),className:rr(t),textSnippet:ir(t),originalRect:r,currentRect:{...r},originalIndex:_,isFixed:s}}var Ns={bg:"rgba(59, 130, 246, 0.08)",border:"rgba(59, 130, 246, 0.5)",pill:"#3b82f6"},Bs=["nw","n","ne","e","se","s","sw","w"],co=24,Ts=16,_o=5;function Ds(t,n,o,s){let r=1/0,i=1/0;const _=t.x,y=t.x+t.width,g=t.x+t.width/2,N=t.y,f=t.y+t.height,R=t.y+t.height/2,b=[];for(const Q of n)o.has(Q.id)||b.push(Q.currentRect);s&&b.push(...s);for(const Q of b){const Ve=Q.x,We=Q.x+Q.width,Me=Q.x+Q.width/2,ye=Q.y,ze=Q.y+Q.height,Ue=Q.y+Q.height/2;for(const xe of[_,y,g])for(const Se of[Ve,We,Me]){const q=Se-xe;Math.abs(q)<_o&&Math.abs(q)<Math.abs(r)&&(r=q)}for(const xe of[N,f,R])for(const Se of[ye,ze,Ue]){const q=Se-xe;Math.abs(q)<_o&&Math.abs(q)<Math.abs(i)&&(i=q)}}const z=Math.abs(r)<_o?r:0,v=Math.abs(i)<_o?i:0,T=[],w=new Set,I=_+z,X=y+z,ae=g+z,re=N+v,Ye=f+v,Xe=R+v;for(const Q of b){const Ve=Q.x,We=Q.x+Q.width,Me=Q.x+Q.width/2,ye=Q.y,ze=Q.y+Q.height,Ue=Q.y+Q.height/2;for(const xe of[Ve,Me,We])for(const Se of[I,ae,X])if(Math.abs(Se-xe)<.5){const q=`x:${Math.round(xe)}`;w.has(q)||(w.add(q),T.push({axis:"x",pos:xe}))}for(const xe of[ye,Ue,ze])for(const Se of[re,Xe,Ye])if(Math.abs(Se-xe)<.5){const q=`y:${Math.round(xe)}`;w.has(q)||(w.add(q),T.push({axis:"y",pos:xe}))}}return{dx:z,dy:v,guides:T}}var Kl=new Set(["script","style","noscript","link","meta","br","hr"]);function Ps(t){let n=t;for(;n&&n!==document.body&&n!==document.documentElement;){if(n.closest("[data-feedback-toolbar]"))return null;if(Kl.has(n.tagName.toLowerCase())){n=n.parentElement;continue}const o=n.getBoundingClientRect();if(o.width>=Ts&&o.height>=Ts)return n;n=n.parentElement}return null}function Gl({rearrangeState:t,onChange:n,isDarkMode:o,exiting:s,className:r,blankCanvas:i,extraSnapRects:_,onSelectionChange:y,deselectSignal:g,onDragMove:N,onDragEnd:f,clearSignal:R}){const{sections:b}=t,z=c.useRef(t);z.current=t;const[v,T]=c.useState(new Set),[w,I]=c.useState(!1),X=c.useRef(R);c.useEffect(()=>{R!==void 0&&R!==X.current&&(X.current=R,b.length>0&&I(!0))},[R,b.length]);const ae=c.useRef(g);c.useEffect(()=>{g!==ae.current&&(ae.current=g,T(new Set))},[g]);const[re,Ye]=c.useState(null),[Xe,Q]=c.useState(!1),Ve=c.useRef(!1),We=c.useCallback(p=>{const x=b.find(M=>M.id===p);x&&(Ve.current=!!x.note,Ye(p),Q(!1))},[b]),Me=c.useCallback(()=>{re&&(Q(!0),ne(()=>{Ye(null),Q(!1)},150))},[re]),ye=c.useCallback(p=>{re&&(n({...t,sections:b.map(x=>x.id===re?{...x,note:p.trim()||void 0}:x)}),Me())},[re,b,t,n,Me]);c.useEffect(()=>{s&&re&&Me()},[s]);const[ze,Ue]=c.useState(new Set),xe=c.useRef(new Map),[Se,q]=c.useState(null),[rt,P]=c.useState(null),[ce,Re]=c.useState([]),[Je,gt]=c.useState(0),ut=c.useRef(null),Yt=c.useRef(new Set),bt=c.useRef(new Map),[Xt,Mt]=c.useState(new Map),[Ot,Ut]=c.useState(new Map),Qt=c.useRef(new Set),yt=c.useRef(new Map),pt=c.useRef(y);pt.current=y;const wt=c.useRef(N);wt.current=N;const $t=c.useRef(f);$t.current=f,c.useEffect(()=>{i&&T(new Set)},[i]);const[Vt,zt]=c.useState(()=>!t.sections.some(p=>{const x=p.originalRect,M=p.currentRect;return Math.abs(x.x-M.x)>1||Math.abs(x.y-M.y)>1||Math.abs(x.width-M.width)>1||Math.abs(x.height-M.height)>1}));c.useEffect(()=>{if(!Vt){const p=ne(()=>zt(!0),380);return()=>clearTimeout(p)}},[]);const qt=c.useRef(new Set);c.useEffect(()=>{qt.current=new Set(b.map(p=>p.selector))},[b]),c.useEffect(()=>{const p=()=>gt(window.scrollY);return p(),window.addEventListener("scroll",p,{passive:!0}),window.addEventListener("resize",p,{passive:!0}),()=>{window.removeEventListener("scroll",p),window.removeEventListener("resize",p)}},[]),c.useEffect(()=>{const p=x=>{if(ut.current){q(null);return}const M=document.elementFromPoint(x.clientX,x.clientY);if(!M){q(null);return}if(M.closest("[data-feedback-toolbar]")){q(null);return}if(M.closest("[data-design-placement]")){q(null);return}if(M.closest("[data-annotation-popup]")){q(null);return}const L=Ps(M);if(!L){q(null);return}for(const A of qt.current)try{const B=document.querySelector(A);if(B&&(B===L||L.contains(B))){q(null);return}}catch{}const V=L.getBoundingClientRect();q({x:V.x,y:V.y,w:V.width,h:V.height})};return document.addEventListener("mousemove",p,{passive:!0}),()=>document.removeEventListener("mousemove",p)},[b]),c.useEffect(()=>{const p=document.body.style.userSelect;return document.body.style.userSelect="none",()=>{document.body.style.userSelect=p}},[]),c.useEffect(()=>{const p=x=>{if(ut.current||x.button!==0)return;const M=x.target;if(!M||M.closest("[data-feedback-toolbar]")||M.closest("[data-design-placement]")||M.closest("[data-annotation-popup]"))return;const L=Ps(M);let V=!1;if(L)for(const B of qt.current)try{const ue=document.querySelector(B);if(ue&&(ue===L||L.contains(ue))){V=!0;break}}catch{}const A=!!(x.shiftKey||x.metaKey||x.ctrlKey);if(L&&!V){x.preventDefault(),x.stopPropagation();const B=ql(L),ue=[...b,B],he=[...t.originalOrder,B.id];n({...t,sections:ue,originalOrder:he});const $e=new Set([B.id]);T($e),pt.current?.($e,A),q(null);const Ae=x.clientX,Z=x.clientY,Le={x:B.currentRect.x,y:B.currentRect.y};B.originalRect;let Ie=!1,ve=0,U=0;ut.current="move";const Oe=oe=>{const De=oe.clientX-Ae,we=oe.clientY-Z;if(!Ie&&(Math.abs(De)>2||Math.abs(we)>2)&&(Ie=!0),!Ie)return;const vt={x:Le.x+De,y:Le.y+we,width:B.currentRect.width,height:B.currentRect.height},ft=Ds(vt,ue,new Set([B.id]),_);Re(ft.guides);const xt=De+ft.dx,Bt=we+ft.dy;ve=xt,U=Bt;const kt=document.querySelector(`[data-rearrange-section="${B.id}"]`);kt&&(kt.style.transform=`translate(${xt}px, ${Bt}px)`),Mt(new Map([[B.id,{x:Le.x+xt,y:Le.y+Bt,width:B.currentRect.width,height:B.currentRect.height}]])),wt.current?.(xt,Bt)},ge=()=>{window.removeEventListener("mousemove",Oe),window.removeEventListener("mouseup",ge),ut.current=null,Re([]),Mt(new Map);const oe=document.querySelector(`[data-rearrange-section="${B.id}"]`);oe&&(oe.style.transform=""),Ie&&n({...t,sections:ue.map(De=>De.id===B.id?{...De,currentRect:{...De.currentRect,x:Math.max(0,Le.x+ve),y:Math.max(0,Le.y+U)}}:De),originalOrder:he}),$t.current?.(ve,U,Ie)};window.addEventListener("mousemove",Oe),window.addEventListener("mouseup",ge)}else if(V&&L){x.preventDefault();for(const B of b)try{const ue=document.querySelector(B.selector);if(ue&&ue===L){const he=new Set([B.id]);T(he),pt.current?.(he,A);return}}catch{}A||(T(new Set),pt.current?.(new Set,!1))}else A||(T(new Set),pt.current?.(new Set,!1))};return document.addEventListener("mousedown",p,!0),()=>document.removeEventListener("mousedown",p,!0)},[b,t,n]),c.useEffect(()=>{const p=x=>{const M=x.target;if(!(M.tagName==="INPUT"||M.tagName==="TEXTAREA"||M.isContentEditable)){if((x.key==="Backspace"||x.key==="Delete")&&v.size>0){x.preventDefault();const L=new Set(v);Ue(V=>{const A=new Set(V);for(const B of L)A.add(B);return A}),T(new Set),ne(()=>{const V=z.current;n({...V,sections:V.sections.filter(A=>!L.has(A.id)),originalOrder:V.originalOrder.filter(A=>!L.has(A))}),Ue(A=>{const B=new Set(A);for(const ue of L)B.delete(ue);return B})},180);return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(x.key)&&v.size>0){x.preventDefault();const L=x.shiftKey?20:1,V=x.key==="ArrowLeft"?-L:x.key==="ArrowRight"?L:0,A=x.key==="ArrowUp"?-L:x.key==="ArrowDown"?L:0;n({...t,sections:b.map(B=>v.has(B.id)?{...B,currentRect:{...B.currentRect,x:Math.max(0,B.currentRect.x+V),y:Math.max(0,B.currentRect.y+A)}}:B)});return}x.key==="Escape"&&v.size>0&&T(new Set)}};return document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[v,b,t,n]);const C=c.useCallback((p,x)=>{if(p.button!==0)return;const M=p.target;if(M.closest(`.${j.handle}`)||M.closest(`.${j.deleteButton}`))return;p.preventDefault(),p.stopPropagation();let L;p.shiftKey||p.metaKey||p.ctrlKey?(L=new Set(v),L.has(x)?L.delete(x):L.add(x)):v.has(x)?L=new Set(v):L=new Set([x]),T(L),(L.size!==v.size||[...L].some(ve=>!v.has(ve)))&&pt.current?.(L,!!(p.shiftKey||p.metaKey||p.ctrlKey));const A=p.clientX,B=p.clientY,ue=new Map;for(const ve of b)L.has(ve.id)&&ue.set(ve.id,{x:ve.currentRect.x,y:ve.currentRect.y});ut.current="move";let he=!1,$e=0,Ae=0;const Z=new Map;for(const ve of b)if(L.has(ve.id)){const U=document.querySelector(`[data-rearrange-section="${ve.id}"]`);Z.set(ve.id,{outlineEl:U,curW:ve.currentRect.width,curH:ve.currentRect.height})}const Le=ve=>{const U=ve.clientX-A,Oe=ve.clientY-B;if(U===0&&Oe===0)return;he=!0;let ge=1/0,oe=1/0,De=-1/0,we=-1/0;for(const[kt,{curW:un,curH:Xn}]of Z){const tt=ue.get(kt);if(!tt)continue;const Ft=tt.x+U,Un=tt.y+Oe;ge=Math.min(ge,Ft),oe=Math.min(oe,Un),De=Math.max(De,Ft+un),we=Math.max(we,Un+Xn)}const vt=Ds({x:ge,y:oe,width:De-ge,height:we-oe},b,L,_),ft=U+vt.dx,xt=Oe+vt.dy;$e=ft,Ae=xt,Re(vt.guides);for(const[,{outlineEl:kt}]of Z)kt&&(kt.style.transform=`translate(${ft}px, ${xt}px)`);const Bt=new Map;for(const[kt,{curW:un,curH:Xn}]of Z){const tt=ue.get(kt);if(tt){const Ft={x:Math.max(0,tt.x+ft),y:Math.max(0,tt.y+xt),width:un,height:Xn};Bt.set(kt,Ft)}}Mt(Bt),wt.current?.(ft,xt)},Ie=ve=>{window.removeEventListener("mousemove",Le),window.removeEventListener("mouseup",Ie),ut.current=null,Re([]),Mt(new Map);for(const[,{outlineEl:U}]of Z)U&&(U.style.transform="");if(he){const U=ve.clientX-A,Oe=ve.clientY-B;if(Math.abs(U)<5&&Math.abs(Oe)<5)n({...t,sections:b.map(ge=>{const oe=ue.get(ge.id);return oe?{...ge,currentRect:{...ge.currentRect,x:oe.x,y:oe.y}}:ge})});else{n({...t,sections:b.map(ge=>{const oe=ue.get(ge.id);return oe?{...ge,currentRect:{...ge.currentRect,x:Math.max(0,oe.x+$e),y:Math.max(0,oe.y+Ae)}}:ge})}),$t.current?.($e,Ae,!0);return}}$t.current?.(0,0,!1)};window.addEventListener("mousemove",Le),window.addEventListener("mouseup",Ie)},[v,b,t,n]),G=c.useCallback((p,x,M)=>{p.preventDefault(),p.stopPropagation();const L=b.find(Le=>Le.id===x);if(!L)return;T(new Set([x])),ut.current="resize";const V=p.clientX,A=p.clientY,B={...L.currentRect};L.originalRect;const ue=B.width/B.height;let he={...B};const $e=document.querySelector(`[data-rearrange-section="${x}"]`),Ae=Le=>{const Ie=Le.clientX-V,ve=Le.clientY-A;let U=B.x,Oe=B.y,ge=B.width,oe=B.height;if(M.includes("e")&&(ge=Math.max(co,B.width+Ie)),M.includes("w")&&(ge=Math.max(co,B.width-Ie),U=B.x+B.width-ge),M.includes("s")&&(oe=Math.max(co,B.height+ve)),M.includes("n")&&(oe=Math.max(co,B.height-ve),Oe=B.y+B.height-oe),Le.shiftKey)if(M.length===2){const we=Math.abs(ge-B.width),vt=Math.abs(oe-B.height);we>vt?oe=ge/ue:ge=oe*ue,M.includes("w")&&(U=B.x+B.width-ge),M.includes("n")&&(Oe=B.y+B.height-oe)}else M==="e"||M==="w"?oe=ge/ue:ge=oe*ue,M==="w"&&(U=B.x+B.width-ge),M==="n"&&(Oe=B.y+B.height-oe);he={x:U,y:Oe,width:ge,height:oe},$e&&($e.style.left=`${U}px`,$e.style.top=`${Oe-Je}px`,$e.style.width=`${ge}px`,$e.style.height=`${oe}px`),P({x:Le.clientX+12,y:Le.clientY+12,text:`${Math.round(ge)} × ${Math.round(oe)}`}),Mt(new Map([[x,he]]))},Z=()=>{window.removeEventListener("mousemove",Ae),window.removeEventListener("mouseup",Z),P(null),ut.current=null,Mt(new Map),n({...t,sections:b.map(Le=>Le.id===x?{...Le,currentRect:he}:Le)})};window.addEventListener("mousemove",Ae),window.addEventListener("mouseup",Z)},[b,t,n,Je]),pe=c.useCallback(p=>{Ue(x=>{const M=new Set(x);return M.add(p),M}),T(x=>{const M=new Set(x);return M.delete(p),M}),ne(()=>{const x=z.current;n({...x,sections:x.sections.filter(M=>M.id!==p),originalOrder:x.originalOrder.filter(M=>M!==p)}),Ue(M=>{const L=new Set(M);return L.delete(p),L})},180)},[n]),ie=p=>{const x=p.originalRect,M=p.currentRect;return Math.abs(x.x-M.x)>1||Math.abs(x.y-M.y)>1||Math.abs(x.width-M.width)>1||Math.abs(x.height-M.height)>1},me=p=>{const x=p.originalRect,M=p.currentRect;return Math.abs(x.x-M.x)>1||Math.abs(x.y-M.y)>1},Be=p=>{const x=p.originalRect,M=p.currentRect;return Math.abs(x.width-M.width)>1||Math.abs(x.height-M.height)>1};for(const p of b)bt.current.has(p.id)||(me(p)?bt.current.set(p.id,"move"):Be(p)&&bt.current.set(p.id,"resize"));for(const p of bt.current.keys())b.some(x=>x.id===p)||bt.current.delete(p);const Ne=b.filter(p=>{try{if(ze.has(p.id)||v.has(p.id))return!0;const x=document.querySelector(p.selector);if(!x)return!1;const M=x.getBoundingClientRect(),L=p.originalRect;return Math.abs(M.width-L.width)+Math.abs(M.height-L.height)<200}catch{return!1}}),be=Ne.filter(p=>ie(p)),Te=Ne.filter(p=>!ie(p)),Ke=new Set(be.map(p=>p.id));for(const p of Yt.current)Ke.has(p)||Yt.current.delete(p);const ee=[...Ke].sort().join(",");for(const p of be)yt.current.set(p.id,{currentRect:p.currentRect,originalRect:p.originalRect,isFixed:p.isFixed});return c.useEffect(()=>{const p=Qt.current;Qt.current=Ke;const x=new Map;for(const M of p)if(!Ke.has(M)){if(!b.some(V=>V.id===M))continue;const L=yt.current.get(M);L&&(x.set(M,{orig:L.originalRect,target:L.currentRect,isFixed:L.isFixed}),yt.current.delete(M))}if(x.size>0){Ut(L=>{const V=new Map(L);for(const[A,B]of x)V.set(A,B);return V});const M=ne(()=>{Ut(L=>{const V=new Map(L);for(const A of x.keys())V.delete(A);return V})},250);return()=>clearTimeout(M)}},[ee,b]),e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:`${j.rearrangeOverlay} ${o?"":j.light} ${s?j.overlayExiting:""}${r?` ${r}`:""}`,"data-feedback-toolbar":!0,children:[Se&&e.jsx("div",{className:j.hoverHighlight,style:{left:Se.x,top:Se.y,width:Se.w,height:Se.h}}),Te.map(p=>{const x=p.currentRect,M=p.isFixed?x.y:x.y-Je,L=Ns,V=v.has(p.id);return e.jsxs("div",{"data-rearrange-section":p.id,className:`${j.sectionOutline} ${V?j.selected:""} ${w||s||ze.has(p.id)?j.exiting:""}`,style:{left:x.x,top:M,width:x.width,height:x.height,borderColor:L.border,backgroundColor:L.bg,...Vt?{}:{opacity:0,animation:"none",transition:"none"}},onMouseDown:A=>C(A,p.id),onDoubleClick:()=>We(p.id),children:[e.jsx("span",{className:j.sectionLabel,style:{backgroundColor:L.pill},children:p.label}),e.jsx("span",{className:`${j.sectionAnnotation} ${p.note?j.annotationVisible:""}`,children:(p.note&&xe.current.set(p.id,p.note),p.note||xe.current.get(p.id)||"")}),e.jsxs("span",{className:j.sectionDimensions,children:[Math.round(x.width)," × ",Math.round(x.height)]}),e.jsx("div",{className:j.deleteButton,onMouseDown:A=>A.stopPropagation(),onClick:()=>pe(p.id),children:"✕"}),Bs.map(A=>e.jsx("div",{className:`${j.handle} ${j[`handle${A.charAt(0).toUpperCase()}${A.slice(1)}`]}`,onMouseDown:B=>G(B,p.id,A)},A))]},p.id)}),be.map(p=>{const x=p.currentRect,M=p.isFixed?x.y:x.y-Je,L=v.has(p.id),V=me(p),A=Be(p);if(i&&!L)return null;const ue=!Yt.current.has(p.id);return ue&&Yt.current.add(p.id),e.jsxs("div",{"data-rearrange-section":p.id,className:`${j.ghostOutline} ${L?j.selected:""} ${w||s||ze.has(p.id)?j.exiting:""}`,style:{left:x.x,top:M,width:x.width,height:x.height,...Vt?{}:{opacity:0,animation:"none",transition:"none"},...ue?{}:{animation:"none"}},onMouseDown:he=>C(he,p.id),onDoubleClick:()=>We(p.id),children:[e.jsx("span",{className:j.sectionLabel,style:{backgroundColor:Ns.pill},children:p.label}),e.jsx("span",{className:`${j.sectionAnnotation} ${p.note?j.annotationVisible:""}`,children:(p.note&&xe.current.set(p.id,p.note),p.note||xe.current.get(p.id)||"")}),e.jsxs("span",{className:j.sectionDimensions,children:[Math.round(x.width)," × ",Math.round(x.height)]}),e.jsx("div",{className:j.deleteButton,onMouseDown:he=>he.stopPropagation(),onClick:()=>pe(p.id),children:"✕"}),Bs.map(he=>e.jsx("div",{className:`${j.handle} ${j[`handle${he.charAt(0).toUpperCase()}${he.slice(1)}`]}`,onMouseDown:$e=>G($e,p.id,he)},he)),e.jsx("span",{className:j.ghostBadge,children:(()=>{const he=bt.current.get(p.id);if(V&&A){const[$e,Ae]=he==="resize"?["Resize","Move"]:["Move","Resize"];return e.jsxs(e.Fragment,{children:["Suggested ",$e," ",e.jsxs("span",{className:j.ghostBadgeExtra,children:["& ",Ae]})]})}return`Suggested ${A?"Resize":"Move"}`})()})]},p.id)})]}),!i&&(()=>{const p=[];for(const x of be){const M=Xt.get(x.id);p.push({id:x.id,orig:x.originalRect,target:M||x.currentRect,isFixed:x.isFixed,isSelected:v.has(x.id),isExiting:ze.has(x.id)})}for(const[x,M]of Xt)if(!p.some(L=>L.id===x)){const L=b.find(V=>V.id===x);L&&p.push({id:x,orig:L.originalRect,target:M,isFixed:L.isFixed,isSelected:v.has(x)})}for(const[x,M]of Ot)p.some(L=>L.id===x)||p.push({id:x,orig:M.orig,target:M.target,isFixed:M.isFixed,isSelected:!1,isExiting:!0});return p.length===0?null:e.jsxs("svg",{className:`${j.connectorSvg} ${w||s?j.connectorExiting:""}`,children:[p.map(({id:x,orig:M,target:L,isFixed:V,isSelected:A,isExiting:B})=>{const ue=M.x+M.width/2,he=(V?M.y:M.y-Je)+M.height/2,$e=L.x+L.width/2,Ae=(V?L.y:L.y-Je)+L.height/2,Z=$e-ue,Le=Ae-he,Ie=Math.sqrt(Z*Z+Le*Le);if(Ie<2)return null;const ve=Math.min(1,Ie/40),U=Math.min(Ie*.3,60),Oe=Ie>0?-Le/Ie:0,ge=Ie>0?Z/Ie:0,oe=(ue+$e)/2+Oe*U,De=(he+Ae)/2+ge*U,we=Xt.has(x),vt=we||A?1:.4,ft=we||A?1:.5;return e.jsxs("g",{className:B?j.connectorExiting:"",children:[e.jsx("path",{className:j.connectorLine,d:`M ${ue} ${he} Q ${oe} ${De} ${$e} ${Ae}`,fill:"none",stroke:"rgba(59, 130, 246, 0.45)",strokeWidth:"1.5",opacity:vt*ve}),e.jsx("circle",{className:j.connectorDot,cx:ue,cy:he,r:4*ve,fill:"rgba(59, 130, 246, 0.8)",stroke:"#fff",strokeWidth:"1.5",opacity:ft*ve,filter:"url(#connDotShadow)"}),e.jsx("circle",{className:j.connectorDot,cx:$e,cy:Ae,r:4*ve,fill:"rgba(59, 130, 246, 0.8)",stroke:"#fff",strokeWidth:"1.5",opacity:ft*ve,filter:"url(#connDotShadow)"})]},`conn-${x}`)}),e.jsx("defs",{children:e.jsx("filter",{id:"connDotShadow",x:"-50%",y:"-50%",width:"200%",height:"200%",children:e.jsx("feDropShadow",{dx:"0",dy:"0.5",stdDeviation:"1",floodOpacity:"0.15"})})})]})})(),re&&(()=>{const p=b.find(Ae=>Ae.id===re);if(!p)return null;const x=p.currentRect,M=p.isFixed?x.y:x.y-Je,L=x.x+x.width/2,V=M-8,A=M+x.height+8,B=V>200,ue=A<window.innerHeight-100,he=Math.max(160,Math.min(window.innerWidth-160,L));let $e;return B?$e={left:he,bottom:window.innerHeight-V}:ue?$e={left:he,top:A}:$e={left:he,top:Math.max(80,window.innerHeight/2-80)},e.jsx(po,{element:p.label,placeholder:"Add a note about this section",initialValue:p.note??"",submitLabel:Ve.current?"Save":"Set",onSubmit:ye,onCancel:Me,onDelete:Ve.current?()=>{ye("")}:void 0,isExiting:Xe,lightMode:!o,style:$e})})(),rt&&e.jsx("div",{className:j.sizeIndicator,style:{left:rt.x,top:rt.y},"data-feedback-toolbar":!0,children:rt.text}),ce.map((p,x)=>e.jsx("div",{className:j.guideLine,style:p.axis==="x"?{position:"fixed",left:p.pos,top:0,width:1,height:"100vh"}:{position:"fixed",left:0,top:p.pos-Je,width:"100vw",height:1}},`${p.axis}-${p.pos}-${x}`))]})}var qo=new Set(["script","style","noscript","link","meta","br","hr"]);function Zl(){const t=document.querySelector("main")||document.body,n=[],o=Array.from(t.children),s=t!==document.body&&o.length<3?Array.from(document.body.children):o;for(const r of s){if(!(r instanceof HTMLElement)||qo.has(r.tagName.toLowerCase())||r.hasAttribute("data-feedback-toolbar"))continue;const i=window.getComputedStyle(r);if(i.display==="none"||i.visibility==="hidden")continue;const _=r.getBoundingClientRect();if(!(_.height<10||_.width<10)){n.push({label:fo(r),selector:_n(r),top:_.top,bottom:_.bottom,left:_.left,right:_.right,area:_.width*_.height});for(const y of Array.from(r.children)){if(!(y instanceof HTMLElement)||qo.has(y.tagName.toLowerCase())||y.hasAttribute("data-feedback-toolbar"))continue;const g=window.getComputedStyle(y);if(g.display==="none"||g.visibility==="hidden")continue;const N=y.getBoundingClientRect();N.height<10||N.width<10||n.push({label:fo(y),selector:_n(y),top:N.top,bottom:N.bottom,left:N.left,right:N.right,area:N.width*N.height})}}}return n}function Jl(t){const n=window.scrollY;return t.map(({label:o,selector:s,rect:r})=>{const i=r.y-n;return{label:o,selector:s,top:i,bottom:i+r.height,left:r.x,right:r.x+r.width,area:r.width*r.height}})}function ea(t){const n=window.scrollY,o=t.y-n,s=t.x;return{top:o,bottom:o+t.height,left:s,right:s+t.width,area:t.width*t.height}}function Ko(t,n){const o=n?Jl(n):Zl(),s=ea(t);let r=null,i=null,_=null,y=null,g=null;for(const v of o){if(Math.abs(v.left-s.left)<2&&Math.abs(v.top-s.top)<2&&Math.abs(v.right-v.left-t.width)<2&&Math.abs(v.bottom-v.top-t.height)<2)continue;v.left<=s.left+2&&v.right>=s.right-2&&v.top<=s.top+2&&v.bottom>=s.bottom-2&&v.area>s.area*1.5&&(!g||v.area<g._area)&&(g={label:v.label,selector:v.selector,_area:v.area});const T=s.right>v.left+5&&s.left<v.right-5,w=s.bottom>v.top+5&&s.top<v.bottom-5;if(T&&v.bottom<=s.top+5){const I=Math.round(s.top-v.bottom);(!r||I<r._dist)&&(r={label:v.label,selector:v.selector,gap:Math.max(0,I),_dist:I})}if(T&&v.top>=s.bottom-5){const I=Math.round(v.top-s.bottom);(!i||I<i._dist)&&(i={label:v.label,selector:v.selector,gap:Math.max(0,I),_dist:I})}if(w&&v.right<=s.left+5){const I=Math.round(s.left-v.right);(!_||I<_._dist)&&(_={label:v.label,selector:v.selector,gap:Math.max(0,I),_dist:I})}if(w&&v.left>=s.right-5){const I=Math.round(v.left-s.right);(!y||I<y._dist)&&(y={label:v.label,selector:v.selector,gap:Math.max(0,I),_dist:I})}}const N=window.innerWidth,f=window.innerHeight,R=na(t,N),b=v=>v?{label:v.label,selector:v.selector,gap:v.gap}:null,z=ta(s,t,N,f,g?{label:g.label,selector:g.selector,_area:g._area}:null,o);return{above:b(r),below:b(i),left:b(_),right:b(y),alignment:R,containedIn:g?{label:g.label,selector:g.selector}:null,outOfBounds:z}}function ta(t,n,o,s,r,i){const _={};let y=!1;const g=[];if(t.left<-2&&g.push("left"),t.right>o+2&&g.push("right"),t.top<-2&&g.push("top"),t.bottom>s+2&&g.push("bottom"),g.length>0&&(_.viewport=g,y=!0),r){const N=i.find(f=>f.label===r.label&&f.selector===r.selector&&Math.abs(f.area-r._area)<10);if(N){const f=[];t.left<N.left-2&&f.push("left"),t.right>N.right+2&&f.push("right"),t.top<N.top-2&&f.push("top"),t.bottom>N.bottom+2&&f.push("bottom"),f.length>0&&(_.container={label:r.label,edges:f},y=!0)}}return y?_:null}function na(t,n){if(t.width/n>.85)return"full-width";const s=t.x+t.width/2,r=n/2,i=s-r,_=n*.08;return Math.abs(i)<_?"center":i<0?"left":"right"}function lr(t){switch(t){case"full-width":return"full-width";case"center":return"centered";case"left":return"left-aligned";case"right":return"right-aligned"}}function ar(t,n={}){const o=[];t.above&&o.push(`Below \`${t.above.label}\`${t.above.gap>0?` (${t.above.gap}px gap)`:""}`),t.below&&o.push(`Above \`${t.below.label}\`${t.below.gap>0?` (${t.below.gap}px gap)`:""}`),n.includeLeftRight&&(t.left&&o.push(`Right of \`${t.left.label}\`${t.left.gap>0?` (${t.left.gap}px gap)`:""}`),t.right&&o.push(`Left of \`${t.right.label}\`${t.right.gap>0?` (${t.right.gap}px gap)`:""}`));const s=lr(t.alignment);return t.containedIn?o.push(`${s.charAt(0).toUpperCase()+s.slice(1)} in \`${t.containedIn.label}\``):o.push(`${s.charAt(0).toUpperCase()+s.slice(1)} in page`),n.includePixelRef&&n.pixelRef&&o.push(`Pixel ref: \`${n.pixelRef}\``),t.outOfBounds&&(t.outOfBounds.viewport&&o.push(`**Outside viewport** (${t.outOfBounds.viewport.join(", ")} edge${t.outOfBounds.viewport.length>1?"s":""})`),t.outOfBounds.container&&o.push(`**Outside \`${t.outOfBounds.container.label}\`** (${t.outOfBounds.container.edges.join(", ")} edge${t.outOfBounds.container.edges.length>1?"s":""})`)),o}function oa(t,n,o){const s=[];t.above&&s.push(`below \`${t.above.label}\``),t.below&&s.push(`above \`${t.below.label}\``),t.left&&s.push(`right of \`${t.left.label}\``),t.right&&s.push(`left of \`${t.right.label}\``),t.containedIn&&s.push(`inside \`${t.containedIn.label}\``),s.push(lr(t.alignment)),t.outOfBounds?.viewport&&s.push(`**outside viewport** (${t.outOfBounds.viewport.join(", ")})`),t.outOfBounds?.container&&s.push(`**outside \`${t.outOfBounds.container.label}\`** (${t.outOfBounds.container.edges.join(", ")})`);const r=o?`, ${Math.round(o.width)}×${Math.round(o.height)}px`:"";return`at (${Math.round(n.x)}, ${Math.round(n.y)})${r}: ${s.join(", ")}`}var Ws=15;function As(t){if(t.length<2)return[];const n=[],o=new Set;for(let s=0;s<t.length;s++){if(o.has(s))continue;const r=[s];for(let i=s+1;i<t.length;i++)o.has(i)||Math.abs(t[s].rect.y-t[i].rect.y)<Ws&&r.push(i);if(r.length>=2){const i=r.map(g=>t[g]);i.sort((g,N)=>g.rect.x-N.rect.x);const _=[];for(let g=0;g<i.length-1;g++)_.push(Math.round(i[g+1].rect.x-(i[g].rect.x+i[g].rect.width)));const y=Math.round(i.reduce((g,N)=>g+N.rect.y,0)/i.length);n.push({labels:i.map(g=>g.label),type:"row",sharedEdge:y,gaps:_,avgGap:_.length?Math.round(_.reduce((g,N)=>g+N,0)/_.length):0}),r.forEach(g=>o.add(g))}}for(let s=0;s<t.length;s++){if(o.has(s))continue;const r=[s];for(let i=s+1;i<t.length;i++)o.has(i)||Math.abs(t[s].rect.x-t[i].rect.x)<Ws&&r.push(i);if(r.length>=2){const i=r.map(g=>t[g]);i.sort((g,N)=>g.rect.y-N.rect.y);const _=[];for(let g=0;g<i.length-1;g++)_.push(Math.round(i[g+1].rect.y-(i[g].rect.y+i[g].rect.height)));const y=Math.round(i.reduce((g,N)=>g+N.rect.x,0)/i.length);n.push({labels:i.map(g=>g.label),type:"column",sharedEdge:y,gaps:_,avgGap:_.length?Math.round(_.reduce((g,N)=>g+N,0)/_.length):0}),r.forEach(g=>o.add(g))}}return n}function sa(t){if(t.length<2)return[];const n=As(t.map(_=>({label:_.label,rect:_.originalRect}))),o=As(t.map(_=>({label:_.label,rect:_.currentRect}))),s=[],r=new Set;for(const _ of n){const y=new Set(_.labels);let g=null,N=0;for(const f of o){const R=f.labels.filter(b=>y.has(b)).length;R>=2&&R>N&&(g=f,N=R)}if(g){const f=g.labels.filter(b=>y.has(b)),R=f.join(", ");if(g.type!==_.type){const b=_.type==="row"?"y":"x",z=g.type==="row"?"y":"x";s.push(`**${R}**: ${_.type} (${b}≈${_.sharedEdge}, ${_.avgGap}px gaps) → ${g.type} (${z}≈${g.sharedEdge}, ${g.avgGap}px gaps)`)}else if(Math.abs(_.sharedEdge-g.sharedEdge)>20||Math.abs(_.avgGap-g.avgGap)>5){const b=_.type==="row"?"y":"x",z=Math.abs(_.sharedEdge-g.sharedEdge)>20?` ${b}: ${_.sharedEdge} → ${g.sharedEdge}`:"",v=Math.abs(_.avgGap-g.avgGap)>5?` gaps: ${_.avgGap}px → ${g.avgGap}px`:"";s.push(`**${R}**: ${_.type} shifted —${z}${v}`)}f.forEach(b=>r.add(b))}else{const f=_.labels.join(", "),R=_.type==="row"?"y":"x";s.push(`**${f}**: ${_.type} (${R}≈${_.sharedEdge}) dissolved`),_.labels.forEach(b=>r.add(b))}}for(const _ of o){if(_.labels.every(N=>r.has(N))||_.labels.filter(N=>!r.has(N)).length<2)continue;if(!n.some(N=>N.labels.filter(R=>_.labels.includes(R)).length>=2)){const N=_.type==="row"?"y":"x";s.push(`**${_.labels.join(", ")}**: new ${_.type} (${N}≈${_.sharedEdge}, ${_.avgGap}px gaps)`),_.labels.forEach(f=>r.add(f))}}const i=t.filter(_=>!r.has(_.label));if(i.length>=2){const _={};for(const y of i){const g=Math.round(y.currentRect.x/5)*5;(_[g]??(_[g]=[])).push(y.label)}for(const[y,g]of Object.entries(_))g.length>=2&&s.push(`**${g.join(", ")}**: shared left edge at x≈${y}`)}return s}function cr(t){if(typeof document>"u")return{viewport:t,contentArea:null};const n=[],o=new Set,s=y=>{o.has(y)||y instanceof HTMLElement&&(y.hasAttribute("data-feedback-toolbar")||qo.has(y.tagName.toLowerCase())||(o.add(y),n.push(y)))},r=document.querySelector("main");r&&s(r);const i=document.querySelector("[role='main']");i&&s(i);for(const y of Array.from(document.body.children))if(s(y),y.children){for(const g of Array.from(y.children))if(s(g),g.children)for(const N of Array.from(g.children))s(N)}let _=null;for(const y of n){const g=y.getBoundingClientRect();if(g.height<50)continue;const N=getComputedStyle(y);if(N.maxWidth&&N.maxWidth!=="none"&&N.maxWidth!=="0px"){(!_||g.width<_.rect.width)&&(_={el:y,rect:g});continue}!_&&g.width<t.width-20&&g.width>100&&(_={el:y,rect:g})}if(_){const{el:y,rect:g}=_;return{viewport:t,contentArea:{width:Math.round(g.width),left:Math.round(g.left),right:Math.round(g.right),centerX:Math.round(g.left+g.width/2),selector:_n(y)}}}return{viewport:t,contentArea:null}}function ra(t){if(typeof document>"u")return null;const n=document.querySelector(t);if(!n?.parentElement)return null;const o=getComputedStyle(n.parentElement),s={parentDisplay:o.display,parentSelector:_n(n.parentElement)};return o.display.includes("flex")&&(s.flexDirection=o.flexDirection),o.display.includes("grid")&&o.gridTemplateColumns!=="none"&&(s.gridCols=o.gridTemplateColumns),o.gap&&o.gap!=="normal"&&o.gap!=="0px"&&(s.gap=o.gap),s}function dr(t,n){const o=n.contentArea,s=o?o.width:n.viewport.width,r=o?o.left:0,i=o?o.centerX:Math.round(n.viewport.width/2),_=Math.round(t.x-r),y=Math.round(r+s-(t.x+t.width)),g=(t.width/s*100).toFixed(1),N=t.x+t.width/2,f=Math.abs(N-i)<20,R=t.width/s>.95,b=[];return R?b.push("`width: 100%` of container"):b.push(`left \`${_}px\` in container, right \`${y}px\`, width \`${g}%\` (\`${Math.round(t.width)}px\`)`),f&&!R&&b.push("centered — `margin-inline: auto`"),b.join(" — ")}function _r(t){const{viewport:n,contentArea:o}=t;let s=`### Reference Frame
`;if(s+=`- Viewport: \`${n.width}×${n.height}px\`
`,o){const r=o;s+=`- Content area: \`${r.width}px\` wide, left edge at \`x=${r.left}\`, right at \`x=${r.right}\` (\`${r.selector}\`)
`,s+=`- Pixel → CSS translation:
`,s+=`  - **Horizontal position in container**: \`element.x - ${r.left}\` → use as \`margin-left\` or \`left\`
`,s+=`  - **Width as % of container**: \`element.width / ${r.width} × 100\` → use as \`width: X%\`
`,s+="  - **Vertical gap between elements**: `nextElement.y - (prevElement.y + prevElement.height)` → use as `margin-top` or `gap`\n",s+=`  - **Centered**: if \`|element.centerX - ${r.centerX}| < 20px\` → use \`margin-inline: auto\`
`}else s+=`- No distinct content container — elements positioned relative to full viewport
`,s+=`- Pixel → CSS translation:
`,s+=`  - **Width as % of viewport**: \`element.width / ${n.width} × 100\` → use as \`width: X%\`
`,s+=`  - **Centered**: if \`|(element.x + element.width/2) - ${Math.round(n.width/2)}| < 20px\` → use \`margin-inline: auto\`
`;return s+=`
`,s}function ia(t){const n=ra(t);if(!n)return null;let o=`\`${n.parentDisplay}\``;return n.flexDirection&&(o+=`, flex-direction: \`${n.flexDirection}\``),n.gridCols&&(o+=`, grid-template-columns: \`${n.gridCols}\``),n.gap&&(o+=`, gap: \`${n.gap}\``),`Parent: ${o} (\`${n.parentSelector}\`)`}function Os(t,n,o,s="standard"){if(t.length===0)return"";const r=[...t].sort((w,I)=>Math.abs(w.y-I.y)<20?w.x-I.x:w.y-I.y);let i="";if(o?.blankCanvas?(i+=`## Wireframe: New Page

`,o.wireframePurpose&&(i+=`> **Purpose:** ${o.wireframePurpose}
>
`),i+=`> ${t.length} component${t.length!==1?"s":""} placed — this is a standalone wireframe, not related to the current page.
>
> This wireframe is a rough sketch for exploring ideas.

`):i+=`## Design Layout

> ${t.length} component${t.length!==1?"s":""} placed

`,s==="compact")return i+=`### Components
`,r.forEach((w,I)=>{const X=Nt[w.type]?.label||w.type;i+=`${I+1}. **${X}** — \`${Math.round(w.width)}×${Math.round(w.height)}px\` at \`(${Math.round(w.x)}, ${Math.round(w.y)})\`
`}),i;const _=cr(n);i+=_r(_),i+=`### Components
`,r.forEach((w,I)=>{const X=Nt[w.type]?.label||w.type,ae={x:w.x,y:w.y,width:w.width,height:w.height};i+=`${I+1}. **${X}** — \`${Math.round(w.width)}×${Math.round(w.height)}px\` at \`(${Math.round(w.x)}, ${Math.round(w.y)})\`
`;const re=Ko(ae),Xe=ar(re,{includeLeftRight:s==="detailed"||s==="forensic"});for(const Ve of Xe)i+=`   - ${Ve}
`;const Q=dr(ae,_);Q&&(i+=`   - CSS: ${Q}
`)}),i+=`
### Layout Analysis
`;const y=[];for(const w of r){const I=y.find(X=>Math.abs(X.y-w.y)<30);I?I.items.push(w):y.push({y:w.y,items:[w]})}if(y.sort((w,I)=>w.y-I.y),y.forEach((w,I)=>{w.items.sort((ae,re)=>ae.x-re.x);const X=w.items.map(ae=>Nt[ae.type]?.label||ae.type);if(w.items.length===1){const re=w.items[0].width>n.width*.8;i+=`- Row ${I+1} (y≈${Math.round(w.y)}): ${X[0]}${re?" — full width":""}
`}else i+=`- Row ${I+1} (y≈${Math.round(w.y)}): ${X.join(" | ")} — ${w.items.length} items side by side
`}),s==="detailed"||s==="forensic"){i+=`
### Spacing & Gaps
`;for(let w=0;w<r.length-1;w++){const I=r[w],X=r[w+1],ae=Nt[I.type]?.label||I.type,re=Nt[X.type]?.label||X.type,Ye=Math.round(X.y-(I.y+I.height)),Xe=Math.round(X.x-(I.x+I.width));Math.abs(I.y-X.y)<30?i+=`- ${ae} → ${re}: \`${Xe}px\` horizontal gap
`:i+=`- ${ae} → ${re}: \`${Ye}px\` vertical gap
`}if(s==="forensic"&&r.length>2){i+=`
### All Pairwise Gaps
`;for(let w=0;w<r.length;w++)for(let I=w+1;I<r.length;I++){const X=r[w],ae=r[I],re=Nt[X.type]?.label||X.type,Ye=Nt[ae.type]?.label||ae.type,Xe=Math.round(ae.y-(X.y+X.height)),Q=Math.round(ae.x-(X.x+X.width));i+=`- ${re} ↔ ${Ye}: h=\`${Q}px\` v=\`${Xe}px\`
`}}s==="forensic"&&(i+=`
### Z-Order (placement order)
`,t.forEach((w,I)=>{const X=Nt[w.type]?.label||w.type;i+=`${I}. ${X} at \`(${Math.round(w.x)}, ${Math.round(w.y)})\`
`}))}i+=`
### Suggested Implementation
`;const g=r.some(w=>w.type==="navigation"),N=r.some(w=>w.type==="hero"),f=r.some(w=>w.type==="sidebar"),R=r.some(w=>w.type==="footer"),b=r.filter(w=>w.type==="card"),z=r.filter(w=>w.type==="form"),v=r.filter(w=>w.type==="table"),T=r.filter(w=>w.type==="modal");if(g&&(i+=`- Top navigation bar with logo + nav links + CTA
`),N&&(i+=`- Hero section with heading, subtext, and call-to-action
`),f&&(i+=`- Sidebar layout — use CSS Grid with sidebar + main content area
`),b.length>1?i+=`- ${b.length}-column card grid — use CSS Grid or Flexbox
`:b.length===1&&(i+=`- Card component with image + content area
`),z.length>0&&(i+=`- ${z.length} form${z.length>1?"s":""} — add proper labels, validation, and submit handling
`),v.length>0&&(i+=`- Data table — consider sortable columns and pagination
`),T.length>0&&(i+=`- Modal dialog — add overlay backdrop and focus trapping
`),R&&(i+=`- Multi-column footer with links
`),s==="detailed"||s==="forensic"){if(i+=`
### CSS Suggestions
`,f){const w=r.find(I=>I.type==="sidebar");i+=`- \`display: grid; grid-template-columns: ${Math.round(w.width)}px 1fr;\`
`}if(b.length>1){const w=Math.round(b[0].width);i+=`- \`display: grid; grid-template-columns: repeat(${b.length}, ${w}px); gap: 16px;\`
`}g&&(i+="- Navigation: `position: sticky; top: 0; z-index: 50;`\n")}return i}function zs(t,n="standard",o){const{sections:s}=t,r=[];for(const f of s){const R=f.originalRect,b=f.currentRect,z=Math.abs(R.x-b.x)>1||Math.abs(R.y-b.y)>1,v=Math.abs(R.width-b.width)>1||Math.abs(R.height-b.height)>1;if(!z&&!v){n==="forensic"&&r.push({section:f,posMoved:!1,sizeChanged:!1});continue}r.push({section:f,posMoved:z,sizeChanged:v})}if(r.length===0||n!=="forensic"&&r.every(f=>!f.posMoved&&!f.sizeChanged))return"";let i=`## Suggested Layout Changes

`;const _=o?o.width:typeof window<"u"?window.innerWidth:0,y=o?o.height:typeof window<"u"?window.innerHeight:0,g=cr({width:_,height:y});n!=="compact"&&(i+=_r(g)),n==="forensic"&&(i+=`> Detected at: \`${new Date(t.detectedAt).toISOString()}\`
`,i+=`> Total sections: ${s.length}

`);const N=f=>s.map(R=>({label:R.label,selector:R.selector,rect:f==="original"?R.originalRect:R.currentRect}));i+=`**Changes:**
`;for(const{section:f,posMoved:R,sizeChanged:b}of r){const z=f.originalRect,v=f.currentRect;if(!R&&!b){i+=`- ${f.label} — unchanged at (${Math.round(v.x)}, ${Math.round(v.y)}) ${Math.round(v.width)}×${Math.round(v.height)}px
`;continue}if(n==="compact"){R&&b?i+=`- Suggested: move **${f.label}** to (${Math.round(v.x)}, ${Math.round(v.y)}) ${Math.round(v.width)}×${Math.round(v.height)}px
`:R?i+=`- Suggested: move **${f.label}** to (${Math.round(v.x)}, ${Math.round(v.y)})
`:i+=`- Suggested: resize **${f.label}** to ${Math.round(v.width)}×${Math.round(v.height)}px
`;continue}if(R&&b?i+=`- Suggested: move and resize **${f.label}**
`:R?i+=`- Suggested: move **${f.label}**
`:i+=`- Suggested: resize **${f.label}** from ${Math.round(z.width)}×${Math.round(z.height)}px to ${Math.round(v.width)}×${Math.round(v.height)}px
`,R){const w=Ko(z,N("original")),I=Ko(v,N("current")),X=b?{width:z.width,height:z.height}:void 0;i+=`  - Currently ${oa(w,{x:z.x,y:z.y},X)}
`;const ae=b?{width:v.width,height:v.height}:void 0,re=`at (${Math.round(v.x)}, ${Math.round(v.y)})`,Ye=ae?`, ${Math.round(ae.width)}×${Math.round(ae.height)}px`:"",Q=ar(I,{includeLeftRight:n==="detailed"||n==="forensic"});if(Q.length>0){i+=`  - Suggested position ${re}${Ye}: ${Q[0]}
`;for(let We=1;We<Q.length;We++)i+=`    ${Q[We]}
`}else i+=`  - Suggested position ${re}${Ye}
`;const Ve=dr(v,g);Ve&&(i+=`  - CSS: ${Ve}
`)}const T=ia(f.selector);if(T&&(i+=`  - ${T}
`),i+=`  - Selector: \`${f.selector}\`
`,n==="detailed"||n==="forensic"){const w=f.className?`${f.tagName}.${f.className.split(" ")[0]}`:f.tagName;w!==f.selector&&(i+=`  - Element: \`${w}\`
`),f.role&&(i+=`  - Role: \`${f.role}\`
`),n==="forensic"&&f.textSnippet&&(i+=`  - Text: "${f.textSnippet}"
`)}n==="forensic"&&(i+=`  - Original rect: \`{ x: ${Math.round(z.x)}, y: ${Math.round(z.y)}, w: ${Math.round(z.width)}, h: ${Math.round(z.height)} }\`
`,i+=`  - Current rect: \`{ x: ${Math.round(v.x)}, y: ${Math.round(v.y)}, w: ${Math.round(v.width)}, h: ${Math.round(v.height)} }\`
`)}if(n!=="compact"){const f=r.filter(b=>b.posMoved).map(b=>({label:b.section.label,originalRect:b.section.originalRect,currentRect:b.section.currentRect})),R=sa(f);if(R.length>0){i+=`
### Layout Summary
`;for(const b of R)i+=`- ${b}
`}}if(n!=="compact"&&s.length>1){i+=`
### All Sections (current positions)
`;const f=[...s].sort((R,b)=>Math.abs(R.currentRect.y-b.currentRect.y)<20?R.currentRect.x-b.currentRect.x:R.currentRect.y-b.currentRect.y);for(const R of f){const b=R.currentRect,z=Math.abs(b.x-R.originalRect.x)>1||Math.abs(b.y-R.originalRect.y)>1||Math.abs(b.width-R.originalRect.width)>1||Math.abs(b.height-R.originalRect.height)>1;i+=`- ${R.label}: \`${Math.round(b.width)}×${Math.round(b.height)}px\` at \`(${Math.round(b.x)}, ${Math.round(b.y)})\`${z?" ← suggested":""}
`}}return i}var Go="feedback-annotations-",ur=7;function yo(t){return`${Go}${t}`}function Wo(t){if(typeof window>"u")return[];try{const n=localStorage.getItem(yo(t));if(!n)return[];const o=JSON.parse(n),s=Date.now()-ur*24*60*60*1e3;return o.filter(r=>!r.timestamp||r.timestamp>s)}catch{return[]}}function hr(t,n){if(!(typeof window>"u"))try{localStorage.setItem(yo(t),JSON.stringify(n))}catch{}}function la(){const t=new Map;if(typeof window>"u")return t;try{const n=Date.now()-ur*24*60*60*1e3;for(let o=0;o<localStorage.length;o++){const s=localStorage.key(o);if(s?.startsWith(Go)){const r=s.slice(Go.length),i=localStorage.getItem(s);if(i){const y=JSON.parse(i).filter(g=>!g.timestamp||g.timestamp>n);y.length>0&&t.set(r,y)}}}}catch{}return t}function An(t,n,o){const s=n.map(r=>({...r,_syncedTo:o}));hr(t,s)}var Jo="agentation-design-";function aa(t){if(typeof window>"u")return[];try{const n=localStorage.getItem(`${Jo}${t}`);return n?JSON.parse(n):[]}catch{return[]}}function ca(t,n){if(!(typeof window>"u"))try{localStorage.setItem(`${Jo}${t}`,JSON.stringify(n))}catch{}}function da(t){if(!(typeof window>"u"))try{localStorage.removeItem(`${Jo}${t}`)}catch{}}var es="agentation-rearrange-";function _a(t){if(typeof window>"u")return null;try{const n=localStorage.getItem(`${es}${t}`);return n?JSON.parse(n):null}catch{return null}}function ua(t,n){if(!(typeof window>"u"))try{localStorage.setItem(`${es}${t}`,JSON.stringify(n))}catch{}}function ha(t){if(!(typeof window>"u"))try{localStorage.removeItem(`${es}${t}`)}catch{}}var ts="agentation-wireframe-";function ma(t){if(typeof window>"u")return null;try{const n=localStorage.getItem(`${ts}${t}`);return n?JSON.parse(n):null}catch{return null}}function Fs(t,n){if(!(typeof window>"u"))try{localStorage.setItem(`${ts}${t}`,JSON.stringify(n))}catch{}}function uo(t){if(!(typeof window>"u"))try{localStorage.removeItem(`${ts}${t}`)}catch{}}var mr="agentation-session-";function ns(t){return`${mr}${t}`}function ga(t){if(typeof window>"u")return null;try{return localStorage.getItem(ns(t))}catch{return null}}function Ao(t,n){if(!(typeof window>"u"))try{localStorage.setItem(ns(t),n)}catch{}}function pa(t){if(!(typeof window>"u"))try{localStorage.removeItem(ns(t))}catch{}}var gr=`${mr}toolbar-hidden`;function fa(){if(typeof window>"u")return!1;try{return sessionStorage.getItem(gr)==="1"}catch{return!1}}function ya(t){if(!(typeof window>"u"))try{t&&sessionStorage.setItem(gr,"1")}catch{}}async function Oo(t,n){const o=await fetch(`${t}/sessions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:n})});if(!o.ok)throw new Error(`Failed to create session: ${o.status}`);return o.json()}async function Hs(t,n){const o=await fetch(`${t}/sessions/${n}`);if(!o.ok)throw new Error(`Failed to get session: ${o.status}`);return o.json()}async function wn(t,n,o){const s=await fetch(`${t}/sessions/${n}/annotations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(!s.ok)throw new Error(`Failed to sync annotation: ${s.status}`);return s.json()}async function Ys(t,n,o){const s=await fetch(`${t}/annotations/${n}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(!s.ok)throw new Error(`Failed to update annotation: ${s.status}`);return s.json()}async function Zt(t,n){const o=await fetch(`${t}/annotations/${n}`,{method:"DELETE"});if(!o.ok)throw new Error(`Failed to delete annotation: ${o.status}`)}var Pe={FunctionComponent:0,ClassComponent:1,IndeterminateComponent:2,HostRoot:3,HostPortal:4,HostComponent:5,HostText:6,Fragment:7,Mode:8,ContextConsumer:9,ContextProvider:10,ForwardRef:11,Profiler:12,SuspenseComponent:13,MemoComponent:14,SimpleMemoComponent:15,LazyComponent:16,IncompleteClassComponent:17,DehydratedFragment:18,SuspenseListComponent:19,ScopeComponent:21,OffscreenComponent:22,LegacyHiddenComponent:23,CacheComponent:24,TracingMarkerComponent:25,HostHoistable:26,HostSingleton:27,IncompleteFunctionComponent:28,Throw:29,ViewTransitionComponent:30,ActivityComponent:31},Xs=new Set(["Component","PureComponent","Fragment","Suspense","Profiler","StrictMode","Routes","Route","Outlet","Root","ErrorBoundaryHandler","HotReload","Hot"]),Us=[/Boundary$/,/BoundaryHandler$/,/Provider$/,/Consumer$/,/^(Inner|Outer)/,/Router$/,/^Client(Page|Segment|Root)/,/^Segment(ViewNode|Node)$/,/^LayoutSegment/,/^Server(Root|Component|Render)/,/^RSC/,/Context$/,/^Hot(Reload)?$/,/^(Dev|React)(Overlay|Tools|Root)/,/Overlay$/,/Handler$/,/^With[A-Z]/,/Wrapper$/,/^Root$/],xa=[/Page$/,/View$/,/Screen$/,/Section$/,/Card$/,/List$/,/Item$/,/Form$/,/Modal$/,/Dialog$/,/Button$/,/Nav$/,/Header$/,/Footer$/,/Layout$/,/Panel$/,/Tab$/,/Menu$/];function ba(t){const n=t?.mode??"filtered";let o=Xs;if(t?.skipExact){const s=t.skipExact instanceof Set?t.skipExact:new Set(t.skipExact);o=new Set([...Xs,...s])}return{maxComponents:t?.maxComponents??6,maxDepth:t?.maxDepth??30,mode:n,skipExact:o,skipPatterns:t?.skipPatterns?[...Us,...t.skipPatterns]:Us,userPatterns:t?.userPatterns??xa,filter:t?.filter}}function wa(t){return t.replace(/([a-z])([A-Z])/g,"$1-$2").replace(/([A-Z])([A-Z][a-z])/g,"$1-$2").toLowerCase()}function va(t,n=10){const o=new Set;let s=t,r=0;for(;s&&r<n;)s.className&&typeof s.className=="string"&&s.className.split(/\s+/).forEach(i=>{if(i.length>1){const _=i.replace(/[_][a-zA-Z0-9]{5,}.*$/,"").toLowerCase();_.length>1&&o.add(_)}}),s=s.parentElement,r++;return o}function ka(t,n){const o=wa(t);for(const s of n){if(s===o)return!0;const r=o.split("-").filter(_=>_.length>2),i=s.split("-").filter(_=>_.length>2);for(const _ of r)for(const y of i)if(_===y||_.includes(y)||y.includes(_))return!0}return!1}function ja(t,n,o,s){if(o.filter)return o.filter(t,n);switch(o.mode){case"all":return!0;case"filtered":return!(o.skipExact.has(t)||o.skipPatterns.some(r=>r.test(t)));case"smart":return o.skipExact.has(t)||o.skipPatterns.some(r=>r.test(t))?!1:!!(s&&ka(t,s)||o.userPatterns.some(r=>r.test(t)));default:return!0}}var vn=null,Ca=new WeakMap;function zo(t){return Object.keys(t).some(n=>n.startsWith("__reactFiber$")||n.startsWith("__reactInternalInstance$")||n.startsWith("__reactProps$"))}function Sa(){if(vn!==null)return vn;if(typeof document>"u")return!1;if(document.body&&zo(document.body))return vn=!0,!0;const t=["#root","#app","#__next","[data-reactroot]"];for(const n of t){const o=document.querySelector(n);if(o&&zo(o))return vn=!0,!0}if(document.body){for(const n of document.body.children)if(zo(n))return vn=!0,!0}return vn=!1,!1}var On={map:Ca};function Ma(t){return Object.keys(t).find(o=>o.startsWith("__reactFiber$")||o.startsWith("__reactInternalInstance$"))||null}function $a(t){const n=Ma(t);return n?t[n]:null}function ln(t){return t?t.displayName?t.displayName:t.name?t.name:null:null}function Ia(t){const{tag:n,type:o,elementType:s}=t;if(n===Pe.HostComponent||n===Pe.HostText||n===Pe.HostHoistable||n===Pe.HostSingleton||n===Pe.Fragment||n===Pe.Mode||n===Pe.Profiler||n===Pe.DehydratedFragment||n===Pe.HostRoot||n===Pe.HostPortal||n===Pe.ScopeComponent||n===Pe.OffscreenComponent||n===Pe.LegacyHiddenComponent||n===Pe.CacheComponent||n===Pe.TracingMarkerComponent||n===Pe.Throw||n===Pe.ViewTransitionComponent||n===Pe.ActivityComponent)return null;if(n===Pe.ForwardRef){const r=s;if(r?.render){const i=ln(r.render);if(i)return i}return r?.displayName?r.displayName:ln(o)}if(n===Pe.MemoComponent||n===Pe.SimpleMemoComponent){const r=s;if(r?.type){const i=ln(r.type);if(i)return i}return r?.displayName?r.displayName:ln(o)}if(n===Pe.ContextProvider){const r=o;return r?._context?.displayName?`${r._context.displayName}.Provider`:null}if(n===Pe.ContextConsumer){const r=o;return r?.displayName?`${r.displayName}.Consumer`:null}if(n===Pe.LazyComponent){const r=s;return r?._status===1&&r._result?ln(r._result):null}return n===Pe.SuspenseComponent||n===Pe.SuspenseListComponent?null:n===Pe.IncompleteClassComponent||n===Pe.IncompleteFunctionComponent||n===Pe.FunctionComponent||n===Pe.ClassComponent||n===Pe.IndeterminateComponent?ln(o):null}function La(t){return t.length<=2||t.length<=3&&t===t.toLowerCase()}function Ea(t,n){const o=ba(n),s=o.mode==="all";if(s){const g=On.map.get(t);if(g!==void 0)return g}if(!Sa()){const g={path:null,components:[]};return s&&On.map.set(t,g),g}const r=o.mode==="smart"?va(t):void 0,i=[];try{let g=$a(t),N=0;for(;g&&N<o.maxDepth&&i.length<o.maxComponents;){const f=Ia(g);f&&!La(f)&&ja(f,N,o,r)&&i.push(f),g=g.return,N++}}catch{const g={path:null,components:[]};return s&&On.map.set(t,g),g}if(i.length===0){const g={path:null,components:[]};return s&&On.map.set(t,g),g}const y={path:i.slice().reverse().map(g=>`<${g}>`).join(" "),components:i};return s&&On.map.set(t,y),y}var zn={FunctionComponent:0,IndeterminateComponent:2,ForwardRef:11,MemoComponent:14,SimpleMemoComponent:15};function Ra(t){if(!t||typeof t!="object")return null;const n=Object.keys(t),o=n.find(i=>i.startsWith("__reactFiber$"));if(o)return t[o]||null;const s=n.find(i=>i.startsWith("__reactInternalInstance$"));if(s)return t[s]||null;const r=n.find(i=>{if(!i.startsWith("__react"))return!1;const _=t[i];return _&&typeof _=="object"&&"_debugSource"in _});return r&&t[r]||null}function Yn(t){if(!t.type||typeof t.type=="string")return null;if(typeof t.type=="object"||typeof t.type=="function"){const n=t.type;if(n.displayName)return n.displayName;if(n.name)return n.name}return null}function Na(t,n=50){let o=t,s=0;for(;o&&s<n;){if(o._debugSource)return{source:o._debugSource,componentName:Yn(o)};if(o._debugOwner?._debugSource)return{source:o._debugOwner._debugSource,componentName:Yn(o._debugOwner)};o=o.return,s++}return null}function Ba(t){let n=t,o=0;const s=50;for(;n&&o<s;){const r=n,i=["_debugSource","__source","_source","debugSource"];for(const _ of i){const y=r[_];if(y&&typeof y=="object"&&"fileName"in y)return{source:y,componentName:Yn(n)}}if(n.memoizedProps){const _=n.memoizedProps;if(_.__source&&typeof _.__source=="object"){const y=_.__source;if(y.fileName&&y.lineNumber)return{source:{fileName:y.fileName,lineNumber:y.lineNumber,columnNumber:y.columnNumber},componentName:Yn(n)}}}n=n.return,o++}return null}var ho=new Map;function Ta(t){const n=t.tag,o=t.type,s=t.elementType;if(typeof o=="string"||o==null||typeof o=="function"&&o.prototype?.isReactComponent)return null;if((n===zn.FunctionComponent||n===zn.IndeterminateComponent)&&typeof o=="function")return o;if(n===zn.ForwardRef&&s){const r=s.render;if(typeof r=="function")return r}if((n===zn.MemoComponent||n===zn.SimpleMemoComponent)&&s){const r=s.type;if(typeof r=="function")return r}return typeof o=="function"?o:null}function Da(){const t=Fr,n=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;if(n&&"H"in n)return{get:()=>n.H,set:s=>{n.H=s}};const o=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;if(o){const s=o.ReactCurrentDispatcher;if(s&&"current"in s)return{get:()=>s.current,set:r=>{s.current=r}}}return null}function Pa(t){const n=t.split(`
`),o=[/source-location/,/\/dist\/index\./,/node_modules\//,/react-dom/,/react\.development/,/react\.production/,/chunk-[A-Z0-9]+/i,/react-stack-bottom-frame/,/react-reconciler/,/scheduler/,/<anonymous>/],s=/^\s*at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)\)?$/,r=/^[^@]*@(.+?):(\d+):(\d+)$/;for(const i of n){const _=i.trim();if(!_||o.some(g=>g.test(_)))continue;const y=s.exec(_)||r.exec(_);if(y)return{fileName:y[1],line:parseInt(y[2],10),column:parseInt(y[3],10)}}return null}function Wa(t){let n=t;return n=n.replace(/[?#].*$/,""),n=n.replace(/^turbopack:\/\/\/\[project\]\//,""),n=n.replace(/^webpack-internal:\/\/\/\.\//,""),n=n.replace(/^webpack-internal:\/\/\//,""),n=n.replace(/^webpack:\/\/\/\.\//,""),n=n.replace(/^webpack:\/\/\//,""),n=n.replace(/^turbopack:\/\/\//,""),n=n.replace(/^https?:\/\/[^/]+\//,""),n=n.replace(/^file:\/\/\//,"/"),n=n.replace(/^\([^)]+\)\/\.\//,""),n=n.replace(/^\.\//,""),n}function Aa(t){const n=Ta(t);if(!n)return null;if(ho.has(n))return ho.get(n);const o=Da();if(!o)return ho.set(n,null),null;const s=o.get();let r=null;try{const i=new Proxy({},{get(){throw new Error("probe")}});o.set(i);try{n({})}catch(_){if(_ instanceof Error&&_.message==="probe"&&_.stack){const y=Pa(_.stack);y&&(r={fileName:Wa(y.fileName),lineNumber:y.line,columnNumber:y.column,componentName:Yn(t)||void 0})}}}finally{o.set(s)}return ho.set(n,r),r}function Oa(t,n=15){let o=t,s=0;for(;o&&s<n;){const r=Aa(o);if(r)return r;o=o.return,s++}return null}function Zo(t){const n=Ra(t);if(!n)return{found:!1,reason:"no-fiber",isReactApp:!1,isProduction:!1};let o=Na(n);if(o||(o=Ba(n)),o?.source)return{found:!0,source:{fileName:o.source.fileName,lineNumber:o.source.lineNumber,columnNumber:o.source.columnNumber,componentName:o.componentName||void 0},isReactApp:!0,isProduction:!1};const s=Oa(n);return s?{found:!0,source:s,isReactApp:!0,isProduction:!1}:{found:!1,reason:"no-debug-source",isReactApp:!0,isProduction:!1}}function za(t,n="path"){const{fileName:o,lineNumber:s,columnNumber:r}=t;let i=`${o}:${s}`;return r!==void 0&&(i+=`:${r}`),n==="vscode"?`vscode://file${o.startsWith("/")?"":"/"}${i}`:i}function Fa(t,n=10){let o=t,s=0;for(;o&&s<n;){const r=Zo(o);if(r.found)return r;o=o.parentElement,s++}return Zo(t)}var Ha=`.styles-module__toolbar___wNsdK svg[fill=none],
.styles-module__markersLayer___-25j1 svg[fill=none],
.styles-module__fixedMarkersLayer___ffyX6 svg[fill=none] {
  fill: none !important;
}
.styles-module__toolbar___wNsdK svg[fill=none] :not([fill]),
.styles-module__markersLayer___-25j1 svg[fill=none] :not([fill]),
.styles-module__fixedMarkersLayer___ffyX6 svg[fill=none] :not([fill]) {
  fill: none !important;
}

.styles-module__controlsContent___9GJWU :where(button, input, select, textarea, label) {
  background: unset;
  border: unset;
  border-radius: unset;
  padding: unset;
  margin: unset;
  color: unset;
  font-family: unset;
  font-weight: unset;
  font-style: unset;
  line-height: unset;
  letter-spacing: unset;
  text-transform: unset;
  text-decoration: unset;
  box-shadow: unset;
  outline: unset;
}

@keyframes styles-module__toolbarEnter___u8RRu {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
@keyframes styles-module__toolbarHide___y8kaT {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
@keyframes styles-module__badgeEnter___mVQLj {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__scaleIn___c-r1K {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__scaleOut___Wctwz {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.85);
  }
}
@keyframes styles-module__slideUp___kgD36 {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes styles-module__slideDown___zcdje {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.85) translateY(8px);
  }
}
@keyframes styles-module__fadeIn___b9qmf {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__fadeOut___6Ut6- {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes styles-module__hoverHighlightIn___6WYHY {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__hoverTooltipIn___FYGQx {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.styles-module__disableTransitions___EopxO :is(*, *::before, *::after) {
  transition: none !important;
}

.styles-module__toolbar___wNsdK {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  width: 337px;
  z-index: 100000;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  pointer-events: none;
  transition: left 0s, top 0s, right 0s, bottom 0s;
}

:where(.styles-module__toolbar___wNsdK) {
  bottom: 1.25rem;
  right: 1.25rem;
}

.styles-module__toolbarContainer___dIhma {
  position: relative;
  user-select: none;
  margin-left: auto;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1), transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__toolbarContainer___dIhma.styles-module__entrance___sgHd8 {
  animation: styles-module__toolbarEnter___u8RRu 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
}
.styles-module__toolbarContainer___dIhma.styles-module__hiding___1td44 {
  animation: styles-module__toolbarHide___y8kaT 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
  pointer-events: none;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  padding: 0;
  cursor: pointer;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn svg {
  margin-top: -1px;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:hover {
  background: #2a2a2a;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:active {
  transform: scale(0.95);
}
.styles-module__toolbarContainer___dIhma.styles-module__expanded___ofKPx {
  height: 44px;
  border-radius: 1.5rem;
  padding: 0.375rem;
  width: 297px;
}
.styles-module__toolbarContainer___dIhma.styles-module__expanded___ofKPx.styles-module__serverConnected___Gfbou {
  width: 337px;
}

.styles-module__toggleContent___0yfyP {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.1s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__toggleContent___0yfyP.styles-module__visible___KHwEW {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.styles-module__toggleContent___0yfyP.styles-module__hidden___Ae8H4 {
  opacity: 0;
  pointer-events: none;
}

.styles-module__controlsContent___9GJWU {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: filter 0.8s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1), transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__controlsContent___9GJWU.styles-module__visible___KHwEW {
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
  visibility: visible;
  pointer-events: auto;
}
.styles-module__controlsContent___9GJWU.styles-module__hidden___Ae8H4 {
  pointer-events: none;
  opacity: 0;
  filter: blur(10px);
  transform: scale(0.4);
}

.styles-module__badge___2XsgF {
  position: absolute;
  top: -13px;
  right: -13px;
  user-select: none;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background-color: var(--agentation-color-accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.2s ease;
  transform: scale(1);
}
.styles-module__badge___2XsgF.styles-module__fadeOut___6Ut6- {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}
.styles-module__badge___2XsgF.styles-module__entrance___sgHd8 {
  animation: styles-module__badgeEnter___mVQLj 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) 0.4s both;
}

.styles-module__controlButton___8Q0jc {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease, opacity 0.2s ease;
}
.styles-module__controlButton___8Q0jc:hover:not(:disabled):not([data-active=true]):not([data-failed=true]):not([data-auto-sync=true]):not([data-error=true]):not([data-no-hover=true]) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.styles-module__controlButton___8Q0jc:active:not(:disabled) {
  transform: scale(0.92);
}
.styles-module__controlButton___8Q0jc:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.styles-module__controlButton___8Q0jc[data-active=true] {
  color: var(--agentation-color-blue);
  background-color: color-mix(in srgb, var(--agentation-color-blue) 25%, transparent);
}
.styles-module__controlButton___8Q0jc[data-error=true] {
  color: var(--agentation-color-red);
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
}
.styles-module__controlButton___8Q0jc[data-danger]:hover:not(:disabled):not([data-active=true]):not([data-failed=true]) {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}
.styles-module__controlButton___8Q0jc[data-no-hover=true], .styles-module__controlButton___8Q0jc.styles-module__statusShowing___te6iu {
  cursor: default;
  pointer-events: none;
  background: transparent !important;
}
.styles-module__controlButton___8Q0jc[data-auto-sync=true] {
  color: var(--agentation-color-green);
  background: transparent;
  cursor: default;
}
.styles-module__controlButton___8Q0jc[data-failed=true] {
  color: var(--agentation-color-red);
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
}

.styles-module__buttonBadge___NeFWb {
  position: absolute;
  top: 0px;
  right: 0px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: var(--agentation-color-accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #1a1a1a, 0 1px 3px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}
[data-agentation-theme=light] .styles-module__buttonBadge___NeFWb {
  box-shadow: 0 0 0 2px #fff, 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes styles-module__mcpIndicatorPulseConnected___EDodZ {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpIndicatorPulseConnecting___cCYte {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-yellow) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--agentation-color-yellow) 0%, transparent);
  }
}
.styles-module__mcpIndicator___zGJeL {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  pointer-events: none;
  transition: background-color 0.3s ease, opacity 0.15s ease, transform 0.15s ease;
  opacity: 1;
  transform: scale(1);
}
.styles-module__mcpIndicator___zGJeL.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpIndicatorPulseConnected___EDodZ 2.5s ease-in-out infinite;
}
.styles-module__mcpIndicator___zGJeL.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpIndicatorPulseConnecting___cCYte 1.5s ease-in-out infinite;
}
.styles-module__mcpIndicator___zGJeL.styles-module__hidden___Ae8H4 {
  opacity: 0;
  transform: scale(0);
  animation: none;
}

@keyframes styles-module__connectionPulse___-Zycw {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}
.styles-module__connectionIndicatorWrapper___L-e-3 {
  width: 8px;
  height: 34px;
  margin-left: 6px;
  margin-right: 6px;
}

.styles-module__connectionIndicator___afk9p {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease, background-color 0.3s ease;
  cursor: default;
}

.styles-module__connectionIndicatorVisible___C-i5B {
  opacity: 1;
}

.styles-module__connectionIndicatorConnected___IY8pR {
  background-color: var(--agentation-color-green);
  animation: styles-module__connectionPulse___-Zycw 2.5s ease-in-out infinite;
}

.styles-module__connectionIndicatorDisconnected___kmpaZ {
  background-color: var(--agentation-color-red);
  animation: none;
}

.styles-module__connectionIndicatorConnecting___QmSLH {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__connectionPulse___-Zycw 1s ease-in-out infinite;
}

.styles-module__buttonWrapper___rBcdv {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
  transition-delay: 0.85s;
}
.styles-module__buttonWrapper___rBcdv:has(.styles-module__controlButton___8Q0jc:disabled):hover .styles-module__buttonTooltip___Burd9 {
  opacity: 0;
  visibility: hidden;
}

.styles-module__tooltipsInSession___-0lHH .styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  transition-delay: 0s;
}

.styles-module__sendButtonWrapper___UUxG6 {
  width: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  margin-left: -0.375rem;
  transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1), margin 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__sendButtonWrapper___UUxG6 .styles-module__controlButton___8Q0jc {
  transform: scale(0.8);
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__sendButtonWrapper___UUxG6.styles-module__sendButtonVisible___WPSQU {
  width: 34px;
  opacity: 1;
  overflow: visible;
  pointer-events: auto;
  margin-left: 0;
}
.styles-module__sendButtonWrapper___UUxG6.styles-module__sendButtonVisible___WPSQU .styles-module__controlButton___8Q0jc {
  transform: scale(1);
}

.styles-module__buttonTooltip___Burd9 {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  padding: 6px 10px;
  background: #1a1a1a;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 100001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: opacity 0.135s ease, transform 0.135s ease, visibility 0.135s ease;
}
.styles-module__buttonTooltip___Burd9::after {
  content: "";
  position: absolute;
  top: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #1a1a1a;
  border-radius: 0 0 2px 0;
}

.styles-module__shortcut___lEAQk {
  margin-left: 4px;
  opacity: 0.5;
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonTooltip___Burd9 {
  bottom: auto;
  top: calc(100% + 14px);
  transform: translateX(-50%) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonTooltip___Burd9::after {
  top: -4px;
  bottom: auto;
  border-radius: 2px 0 0 0;
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-50%) scale(1);
}

.styles-module__tooltipsHidden___VtLJG .styles-module__buttonTooltip___Burd9 {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: none !important;
}

.styles-module__tooltipVisible___0jcCv,
.styles-module__tooltipsHidden___VtLJG .styles-module__tooltipVisible___0jcCv {
  opacity: 1 !important;
  visibility: visible !important;
  transform: translateX(-50%) scale(1) !important;
  transition-delay: 0s !important;
}

.styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9 {
  left: 50%;
  transform: translateX(-12px) scale(0.95);
}
.styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9::after {
  left: 16px;
}
.styles-module__buttonWrapperAlignLeft___myzIp:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(1);
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignLeft___myzIp:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(1);
}

.styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9 {
  left: 50%;
  transform: translateX(calc(-100% + 12px)) scale(0.95);
}
.styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9::after {
  left: auto;
  right: 8px;
}
.styles-module__buttonWrapperAlignRight___HCQFR:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(1);
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignRight___HCQFR:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(1);
}

.styles-module__divider___c--s1 {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.125rem;
}

.styles-module__overlay___Q1O9y {
  position: fixed;
  inset: 0;
  z-index: 99997;
  pointer-events: none;
}
.styles-module__overlay___Q1O9y > * {
  pointer-events: auto;
}

.styles-module__hoverHighlight___ogakW {
  position: fixed;
  border: 2px solid color-mix(in srgb, var(--agentation-color-accent) 50%, transparent);
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--agentation-color-accent) 4%, transparent);
  pointer-events: none !important;
  box-sizing: border-box;
  will-change: opacity;
  contain: layout style;
}
.styles-module__hoverHighlight___ogakW.styles-module__enter___WFIki {
  animation: styles-module__hoverHighlightIn___6WYHY 0.12s ease-out forwards;
}

.styles-module__multiSelectOutline___cSJ-m {
  position: fixed;
  border: 2px dashed color-mix(in srgb, var(--agentation-color-green) 60%, transparent);
  border-radius: 4px;
  pointer-events: none !important;
  background-color: color-mix(in srgb, var(--agentation-color-green) 5%, transparent);
  box-sizing: border-box;
  will-change: opacity;
}
.styles-module__multiSelectOutline___cSJ-m.styles-module__enter___WFIki {
  animation: styles-module__fadeIn___b9qmf 0.15s ease-out forwards;
}
.styles-module__multiSelectOutline___cSJ-m.styles-module__exit___fyOJ0 {
  animation: styles-module__fadeOut___6Ut6- 0.15s ease-out forwards;
}

.styles-module__singleSelectOutline___QhX-O {
  position: fixed;
  border: 2px solid color-mix(in srgb, var(--agentation-color-blue) 60%, transparent);
  border-radius: 4px;
  pointer-events: none !important;
  background-color: color-mix(in srgb, var(--agentation-color-blue) 5%, transparent);
  box-sizing: border-box;
  will-change: opacity;
}
.styles-module__singleSelectOutline___QhX-O.styles-module__enter___WFIki {
  animation: styles-module__fadeIn___b9qmf 0.15s ease-out forwards;
}
.styles-module__singleSelectOutline___QhX-O.styles-module__exit___fyOJ0 {
  animation: styles-module__fadeOut___6Ut6- 0.15s ease-out forwards;
}

.styles-module__hoverTooltip___bvLk7 {
  position: fixed;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.85);
  padding: 0.35rem 0.6rem;
  border-radius: 0.375rem;
  pointer-events: none !important;
  white-space: nowrap;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.styles-module__hoverTooltip___bvLk7.styles-module__enter___WFIki {
  animation: styles-module__hoverTooltipIn___FYGQx 0.1s ease-out forwards;
}

.styles-module__hoverReactPath___gx1IJ {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__hoverElementName___QMLMl {
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markersLayer___-25j1 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  z-index: 99998;
  pointer-events: none;
}
.styles-module__markersLayer___-25j1 > * {
  pointer-events: auto;
}

.styles-module__fixedMarkersLayer___ffyX6 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99998;
  pointer-events: none;
}
.styles-module__fixedMarkersLayer___ffyX6 > * {
  pointer-events: auto;
}

.styles-module__marker___6sQrs {
  position: absolute;
  width: 22px;
  height: 22px;
  background: var(--agentation-color-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  user-select: none;
  will-change: transform, opacity;
  contain: layout style;
  z-index: 1;
}
.styles-module__marker___6sQrs:hover {
  z-index: 2;
}
.styles-module__marker___6sQrs:not(.styles-module__enter___WFIki):not(.styles-module__exit___fyOJ0):not(.styles-module__clearing___FQ--7) {
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.styles-module__marker___6sQrs.styles-module__enter___WFIki {
  animation: styles-module__markerIn___5FaAP 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.styles-module__marker___6sQrs.styles-module__exit___fyOJ0 {
  animation: styles-module__markerOut___GU5jX 0.2s ease-out both;
  pointer-events: none;
}
.styles-module__marker___6sQrs.styles-module__clearing___FQ--7 {
  animation: styles-module__markerOut___GU5jX 0.15s ease-out both;
  pointer-events: none;
}
.styles-module__marker___6sQrs:not(.styles-module__enter___WFIki):not(.styles-module__exit___fyOJ0):not(.styles-module__clearing___FQ--7):hover {
  transform: translate(-50%, -50%) scale(1.1);
}
.styles-module__marker___6sQrs.styles-module__pending___2IHLC {
  position: fixed;
  background-color: var(--agentation-color-blue);
  cursor: default;
}
.styles-module__marker___6sQrs.styles-module__fixed___dBMHC {
  position: fixed;
}
.styles-module__marker___6sQrs.styles-module__multiSelect___YWiuz {
  background-color: var(--agentation-color-green);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 0.75rem;
}
.styles-module__marker___6sQrs.styles-module__multiSelect___YWiuz.styles-module__pending___2IHLC {
  background-color: var(--agentation-color-green);
}
.styles-module__marker___6sQrs.styles-module__hovered___ZgXIy {
  background-color: var(--agentation-color-red);
}

.styles-module__renumber___nCTxD {
  display: block;
  animation: styles-module__renumberRoll___Wgbq3 0.2s ease-out;
}

@keyframes styles-module__renumberRoll___Wgbq3 {
  0% {
    transform: translateX(-40%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.styles-module__markerTooltip___aLJID {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.909);
  z-index: 100002;
  background: #1a1a1a;
  padding: 8px 0.75rem;
  border-radius: 0.75rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  min-width: 120px;
  max-width: 200px;
  pointer-events: none;
  cursor: default;
}
.styles-module__markerTooltip___aLJID.styles-module__enter___WFIki {
  animation: styles-module__tooltipIn___0N31w 0.1s ease-out forwards;
}

.styles-module__markerQuote___FHmrz {
  display: block;
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3125rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markerNote___QkrrS {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-bottom: 2px;
}

.styles-module__markerHint___2iF-6 {
  display: block;
  font-size: 0.625rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.375rem;
  white-space: nowrap;
}

.styles-module__settingsPanel___OxX3Y {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  z-index: 1;
  overflow: hidden;
  background: #1c1c1c;
  border-radius: 1rem;
  padding: 13px 0 16px;
  min-width: 205px;
  cursor: default;
  opacity: 1;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}
.styles-module__settingsPanel___OxX3Y::before, .styles-module__settingsPanel___OxX3Y::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16px;
  z-index: 2;
  pointer-events: none;
}
.styles-module__settingsPanel___OxX3Y::before {
  left: 0;
  background: linear-gradient(to right, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___OxX3Y::after {
  right: 0;
  background: linear-gradient(to left, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___OxX3Y .styles-module__settingsHeader___pwDY9,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsBrand___0gJeM,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsBrandSlash___uTG18,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsVersion___TUcFq,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsSection___m-YM2,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsLabel___8UjfX,
.styles-module__settingsPanel___OxX3Y .styles-module__cycleButton___FMKfw,
.styles-module__settingsPanel___OxX3Y .styles-module__cycleDot___nPgLY,
.styles-module__settingsPanel___OxX3Y .styles-module__dropdownButton___16NPz,
.styles-module__settingsPanel___OxX3Y .styles-module__toggleLabel___Xm8Aa,
.styles-module__settingsPanel___OxX3Y .styles-module__customCheckbox___U39ax,
.styles-module__settingsPanel___OxX3Y .styles-module__sliderLabel___U8sPr,
.styles-module__settingsPanel___OxX3Y .styles-module__slider___GLdxp,
.styles-module__settingsPanel___OxX3Y .styles-module__themeToggle___2rUjA {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__settingsPanel___OxX3Y.styles-module__enter___WFIki {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0px);
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.styles-module__settingsPanel___OxX3Y.styles-module__exit___fyOJ0 {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  filter: blur(5px);
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.1s ease, filter 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y {
  background: #1a1a1a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsLabel___8UjfX {
  color: rgba(255, 255, 255, 0.6);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12 {
  color: rgba(255, 255, 255, 0.85);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12:hover {
  background: rgba(255, 255, 255, 0.1);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12.styles-module__selected___OwRqP {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__toggleLabel___Xm8Aa {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__settingsPanelContainer___Xksv8 {
  overflow: visible;
  position: relative;
  display: flex;
  padding: 0 1rem;
}

.styles-module__settingsPage___6YfHH {
  min-width: 100%;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transition-delay: 0s;
  opacity: 1;
}

.styles-module__settingsPage___6YfHH.styles-module__slideLeft___Ps01J {
  transform: translateX(-24px);
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___uvCq6 {
  position: absolute;
  top: 0;
  left: 24px;
  width: 100%;
  height: 100%;
  padding: 3px 1rem 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___uvCq6.styles-module__slideIn___4-qXe {
  transform: translateX(-24px);
  opacity: 1;
  pointer-events: auto;
}

.styles-module__settingsNavLink___wCzJt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___wCzJt:hover {
  color: rgba(255, 255, 255, 0.9);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt:hover {
  color: rgba(0, 0, 0, 0.8);
}
.styles-module__settingsNavLink___wCzJt svg {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___wCzJt:hover svg {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt svg {
  color: rgba(0, 0, 0, 0.25);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.styles-module__settingsNavLinkRight___ZWwhj {
  display: flex;
  align-items: center;
  gap: 6px;
}

.styles-module__mcpNavIndicator___cl9pO {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpNavIndicator___cl9pO.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___uNggr 2.5s ease-in-out infinite;
}
.styles-module__mcpNavIndicator___cl9pO.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___uNggr 1.5s ease-in-out infinite;
}

.styles-module__settingsBackButton___bIe2j {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0 12px 0;
  margin: -6px 0 0.5rem 0;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___bIe2j svg {
  opacity: 0.4;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.18s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___bIe2j:hover {
  border-bottom-color: rgba(255, 255, 255, 0.07);
}
.styles-module__settingsBackButton___bIe2j:hover svg {
  opacity: 1;
}
[data-agentation-theme=light] .styles-module__settingsBackButton___bIe2j {
  color: rgba(0, 0, 0, 0.85);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsBackButton___bIe2j:hover {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.styles-module__automationHeader___InP0r {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #fff;
}
[data-agentation-theme=light] .styles-module__automationHeader___InP0r {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__automationDescription___NKlmo {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  line-height: 14px;
}
[data-agentation-theme=light] .styles-module__automationDescription___NKlmo {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__learnMoreLink___8xv-x {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__learnMoreLink___8xv-x:hover {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__learnMoreLink___8xv-x {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__learnMoreLink___8xv-x:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__autoSendRow___UblX5 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.styles-module__autoSendLabel___icDc2 {
  font-size: 0.6875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__autoSendLabel___icDc2.styles-module__active___-zoN6 {
  color: #66b8ff;
  color: color(display-p3 0.4 0.72 1);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___icDc2 {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___icDc2.styles-module__active___-zoN6 {
  color: var(--agentation-color-blue);
}

.styles-module__webhookUrlInput___2375C {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 60px;
  box-sizing: border-box;
  margin-top: 11px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 400;
  color: #fff;
  outline: none;
  resize: none;
  user-select: text;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.styles-module__webhookUrlInput___2375C::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__webhookUrlInput___2375C:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__settingsHeader___pwDY9 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin-bottom: 0.5rem;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.styles-module__settingsBrand___0gJeM {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.0094em;
  color: #fff;
  text-decoration: none;
}

.styles-module__settingsBrandSlash___uTG18 {
  color: var(--agentation-color-accent);
  transition: color 0.2s ease;
}

.styles-module__settingsVersion___TUcFq {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
  letter-spacing: -0.0094em;
}

.styles-module__settingsSection___m-YM2 + .styles-module__settingsSection___m-YM2 {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__settingsSection___m-YM2.styles-module__settingsSectionExtraPadding___jdhFV {
  padding-top: calc(0.5rem + 4px);
}

.styles-module__settingsSectionGrow___h-5HZ {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.styles-module__settingsRow___3sdhc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}
.styles-module__settingsRow___3sdhc.styles-module__settingsRowMarginTop___zA0Sp {
  margin-top: 8px;
}

.styles-module__dropdownContainer___BVnxe {
  position: relative;
}

.styles-module__dropdownButton___16NPz {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__dropdownButton___16NPz:hover {
  background: rgba(255, 255, 255, 0.08);
}
.styles-module__dropdownButton___16NPz svg {
  opacity: 0.6;
}

.styles-module__cycleButton___FMKfw {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  letter-spacing: -0.0094em;
}
[data-agentation-theme=light] .styles-module__cycleButton___FMKfw {
  color: rgba(0, 0, 0, 0.85);
}
.styles-module__cycleButton___FMKfw:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.styles-module__settingsRowDisabled___EgS0V .styles-module__settingsLabel___8UjfX {
  color: rgba(255, 255, 255, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsRowDisabled___EgS0V .styles-module__settingsLabel___8UjfX {
  color: rgba(0, 0, 0, 0.2);
}
.styles-module__settingsRowDisabled___EgS0V .styles-module__toggleSwitch___l4Ygm {
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes styles-module__cycleTextIn___Q6zJf {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.styles-module__cycleButtonText___fD1LR {
  display: inline-block;
  animation: styles-module__cycleTextIn___Q6zJf 0.2s ease-out;
}

.styles-module__cycleDots___LWuoQ {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.styles-module__cycleDot___nPgLY {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.667);
  transition: background-color 0.25s ease-out, transform 0.25s ease-out;
}
.styles-module__cycleDot___nPgLY.styles-module__active___-zoN6 {
  background: #fff;
  transform: scale(1);
}
[data-agentation-theme=light] .styles-module__cycleDot___nPgLY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__cycleDot___nPgLY.styles-module__active___-zoN6 {
  background: rgba(0, 0, 0, 0.7);
}

.styles-module__dropdownMenu___k73ER {
  position: absolute;
  right: 0;
  top: calc(100% + 0.25rem);
  background: #1a1a1a;
  border-radius: 0.5rem;
  padding: 0.25rem;
  min-width: 120px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 10;
  animation: styles-module__scaleIn___c-r1K 0.15s ease-out;
}

.styles-module__dropdownItem___ylsLj {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__dropdownItem___ylsLj:hover {
  background: rgba(255, 255, 255, 0.08);
}
.styles-module__dropdownItem___ylsLj.styles-module__selected___OwRqP {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 600;
}

.styles-module__settingsLabel___8UjfX {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.125rem;
}
[data-agentation-theme=light] .styles-module__settingsLabel___8UjfX {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__settingsLabelMarker___ewdtV {
  padding-top: 3px;
  margin-bottom: 10px;
}

.styles-module__settingsOptions___LyrBA {
  display: flex;
  gap: 0.25rem;
}

.styles-module__settingsOption___UNa12 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.styles-module__settingsOption___UNa12:hover {
  background: rgba(0, 0, 0, 0.05);
}
.styles-module__settingsOption___UNa12.styles-module__selected___OwRqP {
  background: color-mix(in srgb, var(--agentation-color-blue) 15%, transparent);
  color: var(--agentation-color-blue);
}

.styles-module__sliderContainer___ducXj {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.styles-module__slider___GLdxp {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.styles-module__slider___GLdxp::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.styles-module__slider___GLdxp::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.styles-module__slider___GLdxp:hover::-webkit-slider-thumb {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
.styles-module__slider___GLdxp:hover::-moz-range-thumb {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.styles-module__sliderLabels___FhLDB {
  display: flex;
  justify-content: space-between;
}

.styles-module__sliderLabel___U8sPr {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.15s ease;
}
.styles-module__sliderLabel___U8sPr:hover {
  color: rgba(255, 255, 255, 0.7);
}
.styles-module__sliderLabel___U8sPr.styles-module__active___-zoN6 {
  color: rgba(255, 255, 255, 0.9);
}

.styles-module__colorOptions___iHCNX {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.375rem;
  margin-bottom: 1px;
}

.styles-module__colorOption___IodiY {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  background-color: var(--swatch);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOption___IodiY {
    background-color: var(--swatch-p3);
  }
}
.styles-module__colorOption___IodiY:hover {
  transform: scale(1.15);
}
.styles-module__colorOption___IodiY.styles-module__selected___OwRqP {
  transform: scale(0.83);
}

.styles-module__colorOptionRing___U2xpo {
  display: flex;
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: border-color 0.3s ease;
}
.styles-module__colorOptionRing___U2xpo.styles-module__selected___OwRqP {
  border-color: var(--swatch);
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOptionRing___U2xpo.styles-module__selected___OwRqP {
    border-color: var(--swatch-p3);
  }
}

.styles-module__settingsToggle___fBrFn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.styles-module__settingsToggle___fBrFn + .styles-module__settingsToggle___fBrFn {
  margin-top: calc(0.5rem + 6px);
}
.styles-module__settingsToggle___fBrFn input[type=checkbox] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.styles-module__settingsToggle___fBrFn.styles-module__settingsToggleMarginBottom___MZUyF {
  margin-bottom: calc(0.5rem + 6px);
}

.styles-module__customCheckbox___U39ax {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.styles-module__customCheckbox___U39ax svg {
  color: #1a1a1a;
  opacity: 1;
  transition: opacity 0.15s ease;
}
input[type=checkbox]:checked + .styles-module__customCheckbox___U39ax {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgb(255, 255, 255);
}
[data-agentation-theme=light] .styles-module__customCheckbox___U39ax {
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #fff;
}
[data-agentation-theme=light] .styles-module__customCheckbox___U39ax.styles-module__checked___mnZLo {
  border-color: #1a1a1a;
  background: #1a1a1a;
}
[data-agentation-theme=light] .styles-module__customCheckbox___U39ax.styles-module__checked___mnZLo svg {
  color: #fff;
}

.styles-module__toggleLabel___Xm8Aa {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
[data-agentation-theme=light] .styles-module__toggleLabel___Xm8Aa {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__toggleSwitch___l4Ygm {
  position: relative;
  display: inline-block;
  width: 24px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.styles-module__toggleSwitch___l4Ygm input {
  opacity: 0;
  width: 0;
  height: 0;
}
.styles-module__toggleSwitch___l4Ygm input:checked + .styles-module__toggleSlider___wprIn {
  background-color: var(--agentation-color-blue);
}
.styles-module__toggleSwitch___l4Ygm input:checked + .styles-module__toggleSlider___wprIn::before {
  transform: translateX(8px);
}
.styles-module__toggleSwitch___l4Ygm.styles-module__disabled___332Jw {
  opacity: 0.4;
}
.styles-module__toggleSwitch___l4Ygm.styles-module__disabled___332Jw .styles-module__toggleSlider___wprIn {
  cursor: not-allowed;
}

.styles-module__toggleSlider___wprIn {
  position: absolute;
  cursor: pointer;
  inset: 0;
  border-radius: 16px;
  background: #484848;
}
[data-agentation-theme=light] .styles-module__toggleSlider___wprIn {
  background: #dddddd;
}
.styles-module__toggleSlider___wprIn::before {
  content: "";
  position: absolute;
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes styles-module__mcpPulse___uNggr {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpPulseError___fov9B {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
}
.styles-module__mcpStatusDot___ibgkc {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___uNggr 1.5s infinite;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___uNggr 2.5s ease-in-out infinite;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__disconnected___cHPxR {
  background-color: var(--agentation-color-red);
  animation: styles-module__mcpPulseError___fov9B 2s infinite;
}

.styles-module__drawCanvas___7cG9U {
  position: fixed;
  inset: 0;
  z-index: 99996;
  pointer-events: none !important;
}
.styles-module__drawCanvas___7cG9U.styles-module__active___-zoN6 {
  pointer-events: auto !important;
  cursor: crosshair !important;
}
.styles-module__drawCanvas___7cG9U.styles-module__active___-zoN6[data-stroke-hover] {
  cursor: pointer !important;
}

.styles-module__dragSelection___kZLq2 {
  position: fixed;
  top: 0;
  left: 0;
  border: 2px solid color-mix(in srgb, var(--agentation-color-green) 60%, transparent);
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--agentation-color-green) 8%, transparent);
  pointer-events: none;
  z-index: 99997;
  will-change: transform, width, height;
  contain: layout style;
}

.styles-module__dragCount___KM90j {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--agentation-color-green);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.styles-module__highlightsContainer___-0xzG {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99996;
}

.styles-module__selectedElementHighlight___fyVlI {
  position: fixed;
  top: 0;
  left: 0;
  border: 2px solid color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--agentation-color-green) 6%, transparent);
  pointer-events: none;
  will-change: transform, width, height;
  contain: layout style;
}

[data-agentation-theme=light] .styles-module__toolbarContainer___dIhma {
  background: #fff;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:hover {
  background: #f5f5f5;
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc:hover:not(:disabled):not([data-active=true]):not([data-failed=true]):not([data-auto-sync=true]):not([data-error=true]):not([data-no-hover=true]) {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-active=true] {
  color: var(--agentation-color-blue);
  background: color-mix(in srgb, var(--agentation-color-blue) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-error=true] {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-danger]:hover:not(:disabled):not([data-active=true]):not([data-failed=true]) {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-auto-sync=true] {
  color: var(--agentation-color-green);
  background: transparent;
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-failed=true] {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__buttonTooltip___Burd9 {
  background: #fff;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__buttonTooltip___Burd9::after {
  background: #fff;
}
[data-agentation-theme=light] .styles-module__divider___c--s1 {
  background: rgba(0, 0, 0, 0.1);
}`,Ya={toolbar:"styles-module__toolbar___wNsdK",markersLayer:"styles-module__markersLayer___-25j1",fixedMarkersLayer:"styles-module__fixedMarkersLayer___ffyX6",controlsContent:"styles-module__controlsContent___9GJWU",disableTransitions:"styles-module__disableTransitions___EopxO",toolbarContainer:"styles-module__toolbarContainer___dIhma",entrance:"styles-module__entrance___sgHd8",toolbarEnter:"styles-module__toolbarEnter___u8RRu",hiding:"styles-module__hiding___1td44",toolbarHide:"styles-module__toolbarHide___y8kaT",collapsed:"styles-module__collapsed___Rydsn",expanded:"styles-module__expanded___ofKPx",serverConnected:"styles-module__serverConnected___Gfbou",toggleContent:"styles-module__toggleContent___0yfyP",visible:"styles-module__visible___KHwEW",hidden:"styles-module__hidden___Ae8H4",badge:"styles-module__badge___2XsgF",fadeOut:"styles-module__fadeOut___6Ut6-",badgeEnter:"styles-module__badgeEnter___mVQLj",controlButton:"styles-module__controlButton___8Q0jc",statusShowing:"styles-module__statusShowing___te6iu",buttonBadge:"styles-module__buttonBadge___NeFWb",mcpIndicator:"styles-module__mcpIndicator___zGJeL",connected:"styles-module__connected___7c28g",mcpIndicatorPulseConnected:"styles-module__mcpIndicatorPulseConnected___EDodZ",connecting:"styles-module__connecting___uo-CW",mcpIndicatorPulseConnecting:"styles-module__mcpIndicatorPulseConnecting___cCYte",connectionIndicatorWrapper:"styles-module__connectionIndicatorWrapper___L-e-3",connectionIndicator:"styles-module__connectionIndicator___afk9p",connectionIndicatorVisible:"styles-module__connectionIndicatorVisible___C-i5B",connectionIndicatorConnected:"styles-module__connectionIndicatorConnected___IY8pR",connectionPulse:"styles-module__connectionPulse___-Zycw",connectionIndicatorDisconnected:"styles-module__connectionIndicatorDisconnected___kmpaZ",connectionIndicatorConnecting:"styles-module__connectionIndicatorConnecting___QmSLH",buttonWrapper:"styles-module__buttonWrapper___rBcdv",buttonTooltip:"styles-module__buttonTooltip___Burd9",tooltipsInSession:"styles-module__tooltipsInSession___-0lHH",sendButtonWrapper:"styles-module__sendButtonWrapper___UUxG6",sendButtonVisible:"styles-module__sendButtonVisible___WPSQU",shortcut:"styles-module__shortcut___lEAQk",tooltipBelow:"styles-module__tooltipBelow___m6ats",tooltipsHidden:"styles-module__tooltipsHidden___VtLJG",tooltipVisible:"styles-module__tooltipVisible___0jcCv",buttonWrapperAlignLeft:"styles-module__buttonWrapperAlignLeft___myzIp",buttonWrapperAlignRight:"styles-module__buttonWrapperAlignRight___HCQFR",divider:"styles-module__divider___c--s1",overlay:"styles-module__overlay___Q1O9y",hoverHighlight:"styles-module__hoverHighlight___ogakW",enter:"styles-module__enter___WFIki",hoverHighlightIn:"styles-module__hoverHighlightIn___6WYHY",multiSelectOutline:"styles-module__multiSelectOutline___cSJ-m",fadeIn:"styles-module__fadeIn___b9qmf",exit:"styles-module__exit___fyOJ0",singleSelectOutline:"styles-module__singleSelectOutline___QhX-O",hoverTooltip:"styles-module__hoverTooltip___bvLk7",hoverTooltipIn:"styles-module__hoverTooltipIn___FYGQx",hoverReactPath:"styles-module__hoverReactPath___gx1IJ",hoverElementName:"styles-module__hoverElementName___QMLMl",marker:"styles-module__marker___6sQrs",clearing:"styles-module__clearing___FQ--7",markerIn:"styles-module__markerIn___5FaAP",markerOut:"styles-module__markerOut___GU5jX",pending:"styles-module__pending___2IHLC",fixed:"styles-module__fixed___dBMHC",multiSelect:"styles-module__multiSelect___YWiuz",hovered:"styles-module__hovered___ZgXIy",renumber:"styles-module__renumber___nCTxD",renumberRoll:"styles-module__renumberRoll___Wgbq3",markerTooltip:"styles-module__markerTooltip___aLJID",tooltipIn:"styles-module__tooltipIn___0N31w",markerQuote:"styles-module__markerQuote___FHmrz",markerNote:"styles-module__markerNote___QkrrS",markerHint:"styles-module__markerHint___2iF-6",settingsPanel:"styles-module__settingsPanel___OxX3Y",settingsHeader:"styles-module__settingsHeader___pwDY9",settingsBrand:"styles-module__settingsBrand___0gJeM",settingsBrandSlash:"styles-module__settingsBrandSlash___uTG18",settingsVersion:"styles-module__settingsVersion___TUcFq",settingsSection:"styles-module__settingsSection___m-YM2",settingsLabel:"styles-module__settingsLabel___8UjfX",cycleButton:"styles-module__cycleButton___FMKfw",cycleDot:"styles-module__cycleDot___nPgLY",dropdownButton:"styles-module__dropdownButton___16NPz",toggleLabel:"styles-module__toggleLabel___Xm8Aa",customCheckbox:"styles-module__customCheckbox___U39ax",sliderLabel:"styles-module__sliderLabel___U8sPr",slider:"styles-module__slider___GLdxp",themeToggle:"styles-module__themeToggle___2rUjA",settingsOption:"styles-module__settingsOption___UNa12",selected:"styles-module__selected___OwRqP",settingsPanelContainer:"styles-module__settingsPanelContainer___Xksv8",settingsPage:"styles-module__settingsPage___6YfHH",slideLeft:"styles-module__slideLeft___Ps01J",automationsPage:"styles-module__automationsPage___uvCq6",slideIn:"styles-module__slideIn___4-qXe",settingsNavLink:"styles-module__settingsNavLink___wCzJt",settingsNavLinkRight:"styles-module__settingsNavLinkRight___ZWwhj",mcpNavIndicator:"styles-module__mcpNavIndicator___cl9pO",mcpPulse:"styles-module__mcpPulse___uNggr",settingsBackButton:"styles-module__settingsBackButton___bIe2j",automationHeader:"styles-module__automationHeader___InP0r",automationDescription:"styles-module__automationDescription___NKlmo",learnMoreLink:"styles-module__learnMoreLink___8xv-x",autoSendRow:"styles-module__autoSendRow___UblX5",autoSendLabel:"styles-module__autoSendLabel___icDc2",active:"styles-module__active___-zoN6",webhookUrlInput:"styles-module__webhookUrlInput___2375C",settingsSectionExtraPadding:"styles-module__settingsSectionExtraPadding___jdhFV",settingsSectionGrow:"styles-module__settingsSectionGrow___h-5HZ",settingsRow:"styles-module__settingsRow___3sdhc",settingsRowMarginTop:"styles-module__settingsRowMarginTop___zA0Sp",dropdownContainer:"styles-module__dropdownContainer___BVnxe",settingsRowDisabled:"styles-module__settingsRowDisabled___EgS0V",toggleSwitch:"styles-module__toggleSwitch___l4Ygm",cycleButtonText:"styles-module__cycleButtonText___fD1LR",cycleTextIn:"styles-module__cycleTextIn___Q6zJf",cycleDots:"styles-module__cycleDots___LWuoQ",dropdownMenu:"styles-module__dropdownMenu___k73ER",scaleIn:"styles-module__scaleIn___c-r1K",dropdownItem:"styles-module__dropdownItem___ylsLj",settingsLabelMarker:"styles-module__settingsLabelMarker___ewdtV",settingsOptions:"styles-module__settingsOptions___LyrBA",sliderContainer:"styles-module__sliderContainer___ducXj",sliderLabels:"styles-module__sliderLabels___FhLDB",colorOptions:"styles-module__colorOptions___iHCNX",colorOption:"styles-module__colorOption___IodiY",colorOptionRing:"styles-module__colorOptionRing___U2xpo",settingsToggle:"styles-module__settingsToggle___fBrFn",settingsToggleMarginBottom:"styles-module__settingsToggleMarginBottom___MZUyF",checked:"styles-module__checked___mnZLo",toggleSlider:"styles-module__toggleSlider___wprIn",disabled:"styles-module__disabled___332Jw",mcpStatusDot:"styles-module__mcpStatusDot___ibgkc",disconnected:"styles-module__disconnected___cHPxR",mcpPulseError:"styles-module__mcpPulseError___fov9B",drawCanvas:"styles-module__drawCanvas___7cG9U",dragSelection:"styles-module__dragSelection___kZLq2",dragCount:"styles-module__dragCount___KM90j",highlightsContainer:"styles-module__highlightsContainer___-0xzG",selectedElementHighlight:"styles-module__selectedElementHighlight___fyVlI",scaleOut:"styles-module__scaleOut___Wctwz",slideUp:"styles-module__slideUp___kgD36",slideDown:"styles-module__slideDown___zcdje"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-page-toolbar-css-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-page-toolbar-css-styles",document.head.appendChild(t)),t.textContent=Ha}var E=Ya,Fn=[{value:"compact",label:"Compact"},{value:"standard",label:"Standard"},{value:"detailed",label:"Detailed"},{value:"forensic",label:"Forensic"}];function Qs(t,n,o="standard"){if(t.length===0)return"";const s=typeof window<"u"?`${window.innerWidth}×${window.innerHeight}`:"unknown";let r=`## Page Feedback: ${n}
`;return o==="forensic"?(r+=`
**Environment:**
`,r+=`- Viewport: ${s}
`,typeof window<"u"&&(r+=`- URL: ${window.location.href}
`,r+=`- User Agent: ${navigator.userAgent}
`,r+=`- Timestamp: ${new Date().toISOString()}
`,r+=`- Device Pixel Ratio: ${window.devicePixelRatio}
`),r+=`
---
`):o!=="compact"&&(r+=`**Viewport:** ${s}
`),r+=`
`,t.forEach((i,_)=>{o==="compact"?(r+=`${_+1}. **${i.element}**${i.sourceFile?` (${i.sourceFile})`:""}: ${i.comment}`,i.selectedText&&(r+=` (re: "${i.selectedText.slice(0,30)}${i.selectedText.length>30?"...":""}")`),r+=`
`):o==="forensic"?(r+=`### ${_+1}. ${i.element}
`,i.isMultiSelect&&i.fullPath&&(r+=`*Forensic data shown for first element of selection*
`),i.fullPath&&(r+=`**Full DOM Path:** ${i.fullPath}
`),i.cssClasses&&(r+=`**CSS Classes:** ${i.cssClasses}
`),i.boundingBox&&(r+=`**Position:** x:${Math.round(i.boundingBox.x)}, y:${Math.round(i.boundingBox.y)} (${Math.round(i.boundingBox.width)}×${Math.round(i.boundingBox.height)}px)
`),r+=`**Annotation at:** ${i.x.toFixed(1)}% from left, ${Math.round(i.y)}px from top
`,i.selectedText&&(r+=`**Selected text:** "${i.selectedText}"
`),i.nearbyText&&!i.selectedText&&(r+=`**Context:** ${i.nearbyText.slice(0,100)}
`),i.computedStyles&&(r+=`**Computed Styles:** ${i.computedStyles}
`),i.accessibility&&(r+=`**Accessibility:** ${i.accessibility}
`),i.nearbyElements&&(r+=`**Nearby Elements:** ${i.nearbyElements}
`),i.sourceFile&&(r+=`**Source:** ${i.sourceFile}
`),i.reactComponents&&(r+=`**React:** ${i.reactComponents}
`),r+=`**Feedback:** ${i.comment}

`):(r+=`### ${_+1}. ${i.element}
`,r+=`**Location:** ${i.elementPath}
`,i.sourceFile&&(r+=`**Source:** ${i.sourceFile}
`),i.reactComponents&&(r+=`**React:** ${i.reactComponents}
`),o==="detailed"&&(i.cssClasses&&(r+=`**Classes:** ${i.cssClasses}
`),i.boundingBox&&(r+=`**Position:** ${Math.round(i.boundingBox.x)}px, ${Math.round(i.boundingBox.y)}px (${Math.round(i.boundingBox.width)}×${Math.round(i.boundingBox.height)}px)
`)),i.selectedText&&(r+=`**Selected text:** "${i.selectedText}"
`),o==="detailed"&&i.nearbyText&&!i.selectedText&&(r+=`**Context:** ${i.nearbyText.slice(0,100)}
`),r+=`**Feedback:** ${i.comment}

`)}),r.trim()}var Xa=`@keyframes styles-module__markerIn___x4G8D {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes styles-module__markerOut___6VhQN {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
}
@keyframes styles-module__tooltipIn___aJslQ {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(2px) scale(0.891);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(0.909);
  }
}
@keyframes styles-module__renumberRoll___akV9B {
  0% {
    transform: translateX(-40%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.styles-module__marker___9CKF7 {
  position: absolute;
  width: 22px;
  height: 22px;
  background: var(--agentation-color-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  user-select: none;
  will-change: transform, opacity;
  contain: layout style;
  z-index: 1;
}
.styles-module__marker___9CKF7:hover {
  z-index: 2;
}
.styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K) {
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.styles-module__marker___9CKF7.styles-module__enter___8kI3q {
  animation: styles-module__markerIn___x4G8D 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.styles-module__marker___9CKF7.styles-module__exit___KBdR3 {
  animation: styles-module__markerOut___6VhQN 0.2s ease-out both;
  pointer-events: none;
}
.styles-module__marker___9CKF7.styles-module__clearing___8rM7K {
  animation: styles-module__markerOut___6VhQN 0.15s ease-out both;
  pointer-events: none;
}
.styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K):hover {
  transform: translate(-50%, -50%) scale(1.1);
}
.styles-module__marker___9CKF7.styles-module__pending___BiY-U {
  position: fixed;
  background-color: var(--agentation-color-blue);
  cursor: default;
}
.styles-module__marker___9CKF7.styles-module__fixed___aKrQO {
  position: fixed;
}
.styles-module__marker___9CKF7.styles-module__multiSelect___CPfTC {
  background-color: var(--agentation-color-green);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 0.75rem;
}
.styles-module__marker___9CKF7.styles-module__multiSelect___CPfTC.styles-module__pending___BiY-U {
  background-color: var(--agentation-color-green);
}
.styles-module__marker___9CKF7.styles-module__hovered___-mg2N {
  background-color: var(--agentation-color-red);
}

.styles-module__renumber___16lvD {
  display: block;
  animation: styles-module__renumberRoll___akV9B 0.2s ease-out;
}

.styles-module__markerTooltip___-VUm- {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.909);
  z-index: 100002;
  background: #1a1a1a;
  padding: 8px 0.75rem;
  border-radius: 0.75rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  min-width: 120px;
  max-width: 200px;
  pointer-events: none;
  cursor: default;
}
.styles-module__markerTooltip___-VUm-.styles-module__enter___8kI3q {
  animation: styles-module__tooltipIn___aJslQ 0.1s ease-out forwards;
}

.styles-module__markerQuote___tQake {
  display: block;
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3125rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markerNote___Rh4eI {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-bottom: 2px;
}

[data-agentation-theme=light] .styles-module__markerTooltip___-VUm- {
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
}
[data-agentation-theme=light] .styles-module__markerTooltip___-VUm- .styles-module__markerQuote___tQake {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__markerTooltip___-VUm- .styles-module__markerNote___Rh4eI {
  color: rgba(0, 0, 0, 0.85);
}`,Ua={marker:"styles-module__marker___9CKF7",enter:"styles-module__enter___8kI3q",exit:"styles-module__exit___KBdR3",clearing:"styles-module__clearing___8rM7K",pending:"styles-module__pending___BiY-U",fixed:"styles-module__fixed___aKrQO",multiSelect:"styles-module__multiSelect___CPfTC",hovered:"styles-module__hovered___-mg2N",renumber:"styles-module__renumber___16lvD",markerTooltip:"styles-module__markerTooltip___-VUm-",markerQuote:"styles-module__markerQuote___tQake",markerNote:"styles-module__markerNote___Rh4eI"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-annotation-marker-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-annotation-marker-styles",document.head.appendChild(t)),t.textContent=Xa}var st=Ua;function Vs({annotation:t,globalIndex:n,layerIndex:o,layerSize:s,isExiting:r,isClearing:i,isAnimated:_,isHovered:y,isDeleting:g,isEditingAny:N,renumberFrom:f,markerClickBehavior:R,tooltipStyle:b,onHoverEnter:z,onHoverLeave:v,onClick:T,onContextMenu:w}){const I=(y||g)&&!N,X=I&&R==="delete",ae=t.isMultiSelect,re=ae?"var(--agentation-color-green)":"var(--agentation-color-accent)",Ye=r?st.exit:i?st.clearing:_?"":st.enter,Xe=r?`${(s-1-o)*20}ms`:`${o*20}ms`;return e.jsxs("div",{className:`${st.marker} ${ae?st.multiSelect:""} ${Ye} ${X?st.hovered:""}`,"data-annotation-marker":!0,style:{left:`${t.x}%`,top:t.y,backgroundColor:X?void 0:re,animationDelay:Xe},onMouseEnter:()=>z(t),onMouseLeave:v,onClick:Q=>{Q.stopPropagation(),r||T(t)},onContextMenu:w?Q=>{R==="delete"&&(Q.preventDefault(),Q.stopPropagation(),r||w(t))}:void 0,children:[I?X?e.jsx(er,{size:ae?18:16}):e.jsx(ri,{size:16}):e.jsx("span",{className:f!==null&&n>=f?st.renumber:void 0,children:n+1}),y&&!N&&e.jsxs("div",{className:`${st.markerTooltip} ${st.enter}`,style:b,children:[e.jsxs("span",{className:st.markerQuote,children:[t.element,t.selectedText&&` "${t.selectedText.slice(0,30)}${t.selectedText.length>30?"...":""}"`]}),e.jsx("span",{className:st.markerNote,children:t.comment})]})]})}function Qa({x:t,y:n,isMultiSelect:o,isExiting:s}){return e.jsx("div",{className:`${st.marker} ${st.pending} ${o?st.multiSelect:""} ${s?st.exit:st.enter}`,style:{left:`${t}%`,top:n,backgroundColor:o?"var(--agentation-color-green)":"var(--agentation-color-accent)"},children:e.jsx(Qr,{size:12})})}function qs({annotation:t,fixed:n}){const o=t.isMultiSelect;return e.jsx("div",{className:`${st.marker} ${n?st.fixed:""} ${st.hovered} ${o?st.multiSelect:""} ${st.exit}`,"data-annotation-marker":!0,style:{left:`${t.x}%`,top:t.y},children:e.jsx(er,{size:o?12:10})})}var Va=`.styles-module__switchContainer___Ka-AB {
  display: flex;
  align-items: center;
  position: relative;
  padding: 2px;
  width: 24px;
  height: 16px;
  border-radius: 8px;
  background-color: #cdcdcd;
  transition: background-color 0.15s, opacity 0.15s;
}
[data-agentation-theme=dark] .styles-module__switchContainer___Ka-AB {
  background-color: #484848;
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:checked) {
  background-color: var(--agentation-color-blue);
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:disabled) {
  opacity: 0.3;
}

.styles-module__switchInput___kYDSD {
  position: absolute;
  z-index: 1;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
}
.styles-module__switchInput___kYDSD:disabled {
  cursor: not-allowed;
}

.styles-module__switchThumb___4sCPH {
  border-radius: 50%;
  width: 12px;
  height: 12px;
  background-color: #fff;
  transition: transform 0.15s;
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:checked) .styles-module__switchThumb___4sCPH {
  transform: translateX(8px);
}`,qa={switchContainer:"styles-module__switchContainer___Ka-AB",switchInput:"styles-module__switchInput___kYDSD",switchThumb:"styles-module__switchThumb___4sCPH"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-switch-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-switch-styles",document.head.appendChild(t)),t.textContent=Va}var Fo=qa,Ho=({className:t="",...n})=>e.jsxs("div",{className:`${Fo.switchContainer} ${t}`,children:[e.jsx("input",{className:Fo.switchInput,type:"checkbox",...n}),e.jsx("div",{className:Fo.switchThumb})]}),Ka=`.styles-module__checkboxContainer___joqZk {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 1px solid rgba(26, 26, 26, 0.2);
  border-radius: 4px;
  width: 14px;
  height: 14px;
  background-color: #fff;
  transition: background-color 0.2s ease;
}
[data-agentation-theme=dark] .styles-module__checkboxContainer___joqZk {
  border-color: rgba(255, 255, 255, 0.2);
  background-color: #252525;
}
.styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) {
  background-color: #1a1a1a;
}
[data-agentation-theme=dark] .styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) {
  background-color: #fff;
}

.styles-module__checkboxInput___ECzzO {
  position: absolute;
  z-index: 1;
  inset: -1px;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
}

.styles-module__checkboxCheck___fUXpr {
  color: #fafafa;
}
[data-agentation-theme=dark] .styles-module__checkboxCheck___fUXpr {
  color: #1a1a1a;
}

.styles-module__checkboxCheckPath___cDyh8 {
  stroke-dasharray: 9.29px;
  stroke-dashoffset: 9.29px;
  color: #fafafa;
  transition: stroke-dashoffset 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__checkboxCheckPath___cDyh8 {
  color: #1a1a1a;
}
.styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) .styles-module__checkboxCheckPath___cDyh8 {
  transition-duration: 0.2s;
  stroke-dashoffset: 0;
}`,Ga={checkboxContainer:"styles-module__checkboxContainer___joqZk",checkboxInput:"styles-module__checkboxInput___ECzzO",checkboxCheck:"styles-module__checkboxCheck___fUXpr",checkboxCheckPath:"styles-module__checkboxCheckPath___cDyh8"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-checkbox-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-checkbox-styles",document.head.appendChild(t)),t.textContent=Ka}var mo=Ga,Za=({className:t="",...n})=>e.jsxs("div",{className:`${mo.checkboxContainer} ${t}`,children:[e.jsx("input",{className:mo.checkboxInput,type:"checkbox",...n}),e.jsx("svg",{className:mo.checkboxCheck,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{className:mo.checkboxCheckPath,d:"M3.94 7L6.13 9.19L10.5 4.81",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),Ja=`.styles-module__container___w8eAF {
  display: flex;
  align-items: center;
  height: 24px;
}

.styles-module__label___J5mxE {
  padding-inline: 8px 2px;
  line-height: 20px;
  font-size: 13px;
  letter-spacing: -0.15px;
  color: rgba(26, 26, 26, 0.5);
  cursor: pointer;
}
[data-agentation-theme=dark] .styles-module__label___J5mxE {
  color: rgba(255, 255, 255, 0.5);
}`,ec={container:"styles-module__container___w8eAF",label:"styles-module__label___J5mxE"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-checkbox-field-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-checkbox-field-styles",document.head.appendChild(t)),t.textContent=Ja}var Ks=ec,Gs=({className:t="",label:n,tooltip:o,checked:s,onChange:r,...i})=>{const _=c.useId();return e.jsxs("div",{className:`${Ks.container} ${t}`,...i,children:[e.jsx(Za,{id:_,onChange:r,checked:s}),e.jsx("label",{className:Ks.label,htmlFor:_,children:n}),o&&e.jsx(dn,{content:o})]})},tc=`@keyframes styles-module__cycleTextIn___VBNTi {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes styles-module__scaleIn___QpQ8E {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__mcpPulse___5Q3Jj {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpPulseError___VHxhx {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
}
@keyframes styles-module__themeIconIn___qUWMV {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-30deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
.styles-module__settingsPanel___qNkn- {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  z-index: 1;
  overflow: hidden;
  background: #1c1c1c;
  border-radius: 16px;
  padding: 12px 0;
  width: 100%;
  max-width: 253px;
  min-width: 205px;
  cursor: default;
  opacity: 1;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}
.styles-module__settingsPanel___qNkn-::before, .styles-module__settingsPanel___qNkn-::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16px;
  z-index: 2;
  pointer-events: none;
}
.styles-module__settingsPanel___qNkn-::before {
  left: 0;
  background: linear-gradient(to right, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___qNkn-::after {
  right: 0;
  background: linear-gradient(to left, #1c1c1c 0%, transparent 100%);
}
.styles-module__settingsPanel___qNkn- .styles-module__settingsHeader___Fn1DP,
.styles-module__settingsPanel___qNkn- .styles-module__settingsBrand___OoKlM,
.styles-module__settingsPanel___qNkn- .styles-module__settingsBrandSlash___Q-AU9,
.styles-module__settingsPanel___qNkn- .styles-module__settingsVersion___rXmL9,
.styles-module__settingsPanel___qNkn- .styles-module__settingsSection___n5V-4,
.styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ,
.styles-module__settingsPanel___qNkn- .styles-module__cycleButton___XMBx3,
.styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY,
.styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8,
.styles-module__settingsPanel___qNkn- .styles-module__sliderLabel___6K5v1,
.styles-module__settingsPanel___qNkn- .styles-module__slider___v5z-c,
.styles-module__settingsPanel___qNkn- .styles-module__themeToggle___3imlT {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__settingsPanel___qNkn-.styles-module__enter___wginS {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0px);
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.styles-module__settingsPanel___qNkn-.styles-module__exit___A4iJc {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  filter: blur(5px);
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.1s ease, filter 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- {
  background: #1a1a1a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ {
  color: rgba(255, 255, 255, 0.6);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH- {
  color: rgba(255, 255, 255, 0.85);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH-:hover {
  background: rgba(255, 255, 255, 0.1);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH-.styles-module__selected___k1-Vq {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.styles-module__settingsPanelContainer___5it-H {
  overflow: visible;
  position: relative;
  display: flex;
  padding: 0 16px;
}

.styles-module__settingsPage___BMn-3 {
  min-width: 100%;
  flex-basis: 0;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transition-delay: 0s;
  opacity: 1;
}

.styles-module__settingsPage___BMn-3.styles-module__slideLeft___qUvW4 {
  transform: translateX(-24px);
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___N7By0 {
  position: absolute;
  top: 0;
  left: 24px;
  width: 100%;
  height: 100%;
  padding: 0 16px 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___N7By0.styles-module__slideIn___uXDSu {
  transform: translateX(-24px);
  opacity: 1;
  pointer-events: auto;
}

.styles-module__settingsHeader___Fn1DP {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
}

.styles-module__settingsBrand___OoKlM {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.0094em;
  color: #fff;
  text-decoration: none;
}

.styles-module__settingsBrandSlash___Q-AU9 {
  color: var(--agentation-color-accent);
  transition: color 0.2s ease;
}

.styles-module__settingsVersion___rXmL9 {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
  letter-spacing: -0.0094em;
}

.styles-module__themeToggle___3imlT {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  transition: background-color 0.15s ease, color 0.15s ease;
  cursor: pointer;
}
.styles-module__themeToggle___3imlT:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}
[data-agentation-theme=light] .styles-module__themeToggle___3imlT {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__themeToggle___3imlT:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.7);
}

.styles-module__themeIconWrapper___pyaYa {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 20px;
  height: 20px;
}

.styles-module__themeIcon___w7lAm {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: styles-module__themeIconIn___qUWMV 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.styles-module__settingsSectionGrow___eZTRw {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.styles-module__settingsRow___y-tDE {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}
.styles-module__settingsRow___y-tDE.styles-module__settingsRowMarginTop___uLpGb {
  margin-top: 8px;
}

.styles-module__settingsRowDisabled___ydl3Q .styles-module__settingsLabel___VCVOQ {
  color: rgba(255, 255, 255, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsRowDisabled___ydl3Q .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.2);
}

.styles-module__settingsLabel___VCVOQ {
  display: flex;
  align-items: center;
  column-gap: 2px;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.15px;
  color: rgba(255, 255, 255, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__cycleButton___XMBx3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  letter-spacing: -0.0094em;
}
[data-agentation-theme=light] .styles-module__cycleButton___XMBx3 {
  color: rgba(0, 0, 0, 0.85);
}
.styles-module__cycleButton___XMBx3:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.styles-module__cycleButtonText___mbbnD {
  display: inline-block;
  animation: styles-module__cycleTextIn___VBNTi 0.2s ease-out;
}

.styles-module__cycleDots___ehp6i {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.styles-module__cycleDot___zgSXY {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.667);
  transition: background-color 0.25s ease-out, transform 0.25s ease-out;
}
.styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: #fff;
  transform: scale(1);
}
[data-agentation-theme=light] .styles-module__cycleDot___zgSXY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: rgba(0, 0, 0, 0.7);
}

.styles-module__colorOptions___pbxZx {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  height: 26px;
}

.styles-module__colorOption___Co955 {
  padding: 0;
  position: relative;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: #fff;
  cursor: pointer;
}
[data-agentation-theme=dark] .styles-module__colorOption___Co955 {
  background-color: #1a1a1a;
}
.styles-module__colorOption___Co955::before, .styles-module__colorOption___Co955::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: var(--swatch);
  transition: opacity 0.2s, transform 0.2s;
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOption___Co955::before, .styles-module__colorOption___Co955::after {
    --color: var(--swatch-p3);
  }
}
.styles-module__colorOption___Co955::after {
  z-index: -1;
  transform: scale(1.2);
  opacity: 0;
}
.styles-module__colorOption___Co955.styles-module__selected___k1-Vq::before {
  transform: scale(0.8);
}
.styles-module__colorOption___Co955.styles-module__selected___k1-Vq::after {
  opacity: 1;
}

.styles-module__settingsNavLink___uYIwM {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.15s ease;
  cursor: pointer;
}
.styles-module__settingsNavLink___uYIwM:hover {
  color: rgba(255, 255, 255, 0.9);
}
.styles-module__settingsNavLink___uYIwM svg {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___uYIwM:hover svg {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM:hover {
  color: rgba(0, 0, 0, 0.8);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM svg {
  color: rgba(0, 0, 0, 0.25);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.styles-module__settingsNavLinkRight___XBUzC {
  display: flex;
  align-items: center;
  gap: 6px;
}

.styles-module__settingsBackButton___fflll {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  background: transparent;
  font-family: inherit;
  line-height: 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___fflll svg {
  opacity: 0.4;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.18s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___fflll:hover svg {
  opacity: 1;
}
[data-agentation-theme=light] .styles-module__settingsBackButton___fflll {
  color: rgba(0, 0, 0, 0.85);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.styles-module__automationHeader___Avra9 {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #fff;
}
[data-agentation-theme=light] .styles-module__automationHeader___Avra9 {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__automationDescription___vFTmJ {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  line-height: 14px;
}
[data-agentation-theme=light] .styles-module__automationDescription___vFTmJ {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__learnMoreLink___cG7OI {
  color: rgba(255, 255, 255, 0.8);
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__learnMoreLink___cG7OI:hover {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__learnMoreLink___cG7OI {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__learnMoreLink___cG7OI:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__autoSendContainer___VpkXk {
  display: flex;
  align-items: center;
}

.styles-module__autoSendLabel___ngNdC {
  padding-inline-end: 8px;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s, opacity 0.15s;
  cursor: pointer;
}
.styles-module__autoSendLabel___ngNdC.styles-module__active___dpAhM {
  color: #66b8ff;
  color: color(display-p3 0.4 0.72 1);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___ngNdC {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___ngNdC.styles-module__active___dpAhM {
  color: var(--agentation-color-blue);
}
.styles-module__autoSendLabel___ngNdC.styles-module__disabled___9AZYS {
  opacity: 0.3;
  cursor: not-allowed;
}

.styles-module__mcpStatusDot___8AMxP {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__connecting___QEO1r {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___5Q3Jj 1.5s infinite;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__connected___WyFkx {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___5Q3Jj 2.5s ease-in-out infinite;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__disconnected___mvmvQ {
  background-color: var(--agentation-color-red);
  animation: styles-module__mcpPulseError___VHxhx 2s infinite;
}

.styles-module__mcpNavIndicator___auBHI {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpNavIndicator___auBHI.styles-module__connected___WyFkx {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___5Q3Jj 2.5s ease-in-out infinite;
}
.styles-module__mcpNavIndicator___auBHI.styles-module__connecting___QEO1r {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___5Q3Jj 1.5s ease-in-out infinite;
}

.styles-module__webhookUrlInput___WDDDC {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 60px;
  box-sizing: border-box;
  margin-top: 11px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 400;
  color: #fff;
  outline: none;
  resize: none;
  user-select: text;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.styles-module__webhookUrlInput___WDDDC::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__webhookUrlInput___WDDDC:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn-::before {
  background: linear-gradient(to right, #fff 0%, transparent 100%);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn-::after {
  background: linear-gradient(to left, #fff 0%, transparent 100%);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsHeader___Fn1DP {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsBrand___OoKlM {
  color: #E5484D;
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsVersion___rXmL9 {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsSection___n5V-4 {
  border-top-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleButton___XMBx3 {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: rgba(0, 0, 0, 0.7);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8 {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8:hover {
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__checkboxField___ZrSqv:not(:first-child) {
  margin-top: 8px;
}

.styles-module__divider___h6Yux {
  margin-block: 8px;
  width: 100%;
  height: 1px;
  background-color: rgba(26, 26, 26, 0.07);
}
[data-agentation-theme=dark] .styles-module__divider___h6Yux {
  background-color: rgba(255, 255, 255, 0.07);
}`,nc={settingsPanel:"styles-module__settingsPanel___qNkn-",settingsHeader:"styles-module__settingsHeader___Fn1DP",settingsBrand:"styles-module__settingsBrand___OoKlM",settingsBrandSlash:"styles-module__settingsBrandSlash___Q-AU9",settingsVersion:"styles-module__settingsVersion___rXmL9",settingsSection:"styles-module__settingsSection___n5V-4",settingsLabel:"styles-module__settingsLabel___VCVOQ",cycleButton:"styles-module__cycleButton___XMBx3",cycleDot:"styles-module__cycleDot___zgSXY",dropdownButton:"styles-module__dropdownButton___mKHe8",sliderLabel:"styles-module__sliderLabel___6K5v1",slider:"styles-module__slider___v5z-c",themeToggle:"styles-module__themeToggle___3imlT",enter:"styles-module__enter___wginS",exit:"styles-module__exit___A4iJc",settingsOption:"styles-module__settingsOption___JoyH-",selected:"styles-module__selected___k1-Vq",settingsPanelContainer:"styles-module__settingsPanelContainer___5it-H",settingsPage:"styles-module__settingsPage___BMn-3",slideLeft:"styles-module__slideLeft___qUvW4",automationsPage:"styles-module__automationsPage___N7By0",slideIn:"styles-module__slideIn___uXDSu",themeIconWrapper:"styles-module__themeIconWrapper___pyaYa",themeIcon:"styles-module__themeIcon___w7lAm",themeIconIn:"styles-module__themeIconIn___qUWMV",settingsSectionGrow:"styles-module__settingsSectionGrow___eZTRw",settingsRow:"styles-module__settingsRow___y-tDE",settingsRowMarginTop:"styles-module__settingsRowMarginTop___uLpGb",settingsRowDisabled:"styles-module__settingsRowDisabled___ydl3Q",cycleButtonText:"styles-module__cycleButtonText___mbbnD",cycleTextIn:"styles-module__cycleTextIn___VBNTi",cycleDots:"styles-module__cycleDots___ehp6i",active:"styles-module__active___dpAhM",colorOptions:"styles-module__colorOptions___pbxZx",colorOption:"styles-module__colorOption___Co955",settingsNavLink:"styles-module__settingsNavLink___uYIwM",settingsNavLinkRight:"styles-module__settingsNavLinkRight___XBUzC",settingsBackButton:"styles-module__settingsBackButton___fflll",automationHeader:"styles-module__automationHeader___Avra9",automationDescription:"styles-module__automationDescription___vFTmJ",learnMoreLink:"styles-module__learnMoreLink___cG7OI",autoSendContainer:"styles-module__autoSendContainer___VpkXk",autoSendLabel:"styles-module__autoSendLabel___ngNdC",disabled:"styles-module__disabled___9AZYS",mcpStatusDot:"styles-module__mcpStatusDot___8AMxP",connecting:"styles-module__connecting___QEO1r",mcpPulse:"styles-module__mcpPulse___5Q3Jj",connected:"styles-module__connected___WyFkx",disconnected:"styles-module__disconnected___mvmvQ",mcpPulseError:"styles-module__mcpPulseError___VHxhx",mcpNavIndicator:"styles-module__mcpNavIndicator___auBHI",webhookUrlInput:"styles-module__webhookUrlInput___WDDDC",checkboxField:"styles-module__checkboxField___ZrSqv",divider:"styles-module__divider___h6Yux",scaleIn:"styles-module__scaleIn___QpQ8E"};if(typeof document<"u"){let t=document.getElementById("feedback-tool-styles-settings-panel-styles");t||(t=document.createElement("style"),t.id="feedback-tool-styles-settings-panel-styles",document.head.appendChild(t)),t.textContent=tc}var H=nc;function oc({settings:t,onSettingsChange:n,isDarkMode:o,onToggleTheme:s,isDevMode:r,connectionStatus:i,endpoint:_,isVisible:y,toolbarNearBottom:g,settingsPage:N,onSettingsPageChange:f,onHideToolbar:R}){return e.jsx("div",{className:`${H.settingsPanel} ${y?H.enter:H.exit}`,style:g?{bottom:"auto",top:"calc(100% + 0.5rem)"}:void 0,"data-agentation-settings-panel":!0,children:e.jsxs("div",{className:H.settingsPanelContainer,children:[e.jsxs("div",{className:`${H.settingsPage} ${N==="automations"?H.slideLeft:""}`,children:[e.jsxs("div",{className:H.settingsHeader,children:[e.jsx("a",{className:H.settingsBrand,href:"https://agentation.com",target:"_blank",rel:"noopener noreferrer",children:e.jsx("svg",{width:"72",height:"16",viewBox:"0 0 676 151",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M79.6666 100.561L104.863 15.5213C107.828 4.03448 99.1201 -3.00582 88.7449 1.25541L3.52015 39.6065C1.48217 40.5329 0 42.7562 0 45.1647C0 48.6848 2.77907 51.4639 6.29922 51.4639C7.22558 51.4639 8.15193 51.2786 9.07829 50.9081L93.7472 12.7422C97.2674 11.0748 93.7472 8.29572 92.6356 12.1864L67.624 97.2259C66.5123 100.931 69.4767 105.193 73.7379 105.193C76.517 105.193 79.1108 103.155 79.6666 100.561ZM663.641 100.005C665.679 107.231 677.537 104.081 675.499 96.8553L666.05 66.2856C663.456 57.7631 655.489 55.7251 648.82 61.098L618.991 86.6654C617.324 87.9623 621.029 89.815 621.214 88.1476L625.846 61.6538C626.958 55.3546 624.179 50.5375 615.841 50.5375L579.158 51.0934C576.008 51.0934 578.417 53.8724 578.417 57.022C578.417 60.1716 580.825 61.6538 583.975 61.6538L616.212 60.9127C616.397 60.9127 614.544 59.6158 614.544 59.8011L609.727 88.7034C607.875 99.6344 617.694 102.784 626.031 95.7437L655.86 70.1763L654.192 69.6205L663.641 100.005ZM571.191 89.0739C555.443 88.7034 562.298 61.4685 578.787 61.8391C594.72 62.0243 587.124 89.2592 571.191 89.0739ZM571.006 100.375C601.575 100.931 611.024 51.6492 579.158 51.0934C547.847 50.5375 540.065 99.8197 571.006 100.375ZM521.909 46.4616C525.985 46.4616 529.505 42.9414 529.505 38.6802C529.505 34.4189 525.985 31.0841 521.909 31.0841C517.833 31.0841 514.127 34.6042 514.127 38.6802C514.127 42.7562 517.648 46.4616 521.909 46.4616ZM472.256 103.525C493.192 103.71 515.98 73.3259 519.13 62.3949L509.866 60.9127C505.234 73.3259 497.638 101.672 519.871 102.043C536.545 102.228 552.479 85.3685 563.595 70.1763C564.151 69.2499 564.706 68.1383 564.706 66.8414C564.706 63.6918 563.965 61.098 560.816 61.098C558.963 61.098 557.296 62.0243 556.184 63.5065C546.365 77.0313 530.802 90.9266 522.094 90.7414C511.904 90.5561 517.462 71.4732 519.871 64.9887C523.391 55.7251 512.831 53.5019 509.681 60.9127C506.531 68.6941 488.19 92.4088 475.035 92.2235C467.439 92.0383 464.29 83.8863 472.441 59.9864L486.707 17.7445C487.634 14.4097 485.41 10.519 481.334 10.519C478.741 10.519 476.517 12.1864 475.962 14.4097L461.696 56.4662C451.506 86.4801 455.211 103.155 472.256 103.525ZM447.43 42.5709L496.527 41.4593C499.306 41.4593 501.529 39.0507 501.529 36.2717C501.529 33.3073 499.306 31.0841 496.341 31.0841L447.245 32.1957C444.466 32.1957 442.242 34.4189 442.242 37.3833C442.242 40.1624 444.466 42.5709 447.43 42.5709ZM422.974 106.304C435.387 106.489 457.249 94.8173 472.441 53.8724C473.553 50.7228 472.071 48.3143 468.365 48.3143C466.142 48.3143 464.29 49.6112 463.548 51.6492C450.394 87.2212 431.682 96.1142 424.456 95.929C419.454 95.929 417.972 93.3352 418.713 85.5538C419.454 78.1429 410.376 74.9933 406.114 81.1073C401.297 87.777 394.442 94.2615 385.549 94.0763C370.172 93.891 376.471 67.0267 399.815 67.3972C408.338 67.5825 414.452 71.4732 417.045 76.6608C417.786 78.3282 419.454 79.6251 421.492 79.6251C424.271 79.6251 426.679 77.2166 426.679 74.4375C426.679 73.6964 426.494 72.9553 426.124 72.2143C421.862 63.6918 412.414 57.3926 400 57.2073C363.502 56.6515 353.497 104.451 383.326 104.822C397.036 105.193 410.005 94.0763 413.34 85.9243C412.599 86.8507 408.338 86.6654 408.523 84.4422C407.411 97.4111 410.931 106.119 422.974 106.304ZM335.897 104.266C335.897 115.012 347.569 117.606 347.569 103.34C347.569 89.0739 358.5 54.4282 361.464 45.1647L396.666 43.6825C405.929 43.1267 404.262 33.1221 397.036 33.3073L364.984 34.4189L368.875 22.7469C369.801 20.1531 370.542 17.9298 370.542 16.2624C370.542 13.4833 368.504 11.8159 365.911 11.8159C362.946 11.8159 360.352 12.7422 357.573 21.0794L352.942 35.16L330.153 36.0864C326.263 36.4569 323.483 38.1244 323.483 41.6445C323.483 45.5352 326.448 47.0174 330.709 46.8321L349.421 45.9058C345.901 56.6515 335.897 90.7414 335.897 104.266ZM186.939 78.6988C193.979 56.4662 212.877 54.984 212.877 62.9507C212.877 68.3236 203.984 77.0313 186.939 78.6988ZM113.942 150.955C142.844 152.437 159.704 111.492 160.63 80.5515C161.556 73.3259 153.96 70.3616 148.773 75.7344C141.918 83.1453 129.505 93.1499 119.685 93.1499C103.011 93.1499 116.165 59.8011 143.956 59.8011C149.514 59.8011 153.59 61.6538 156.184 64.0623C160.815 68.3236 170.82 62.0243 165.818 56.0957C161.927 51.4639 155.072 48.129 144.882 48.129C102.455 48.129 83.7426 105.007 116.721 105.007C134.692 105.007 151.367 88.3329 155.257 82.7747C154.516 83.5158 149.329 81.2925 149.699 79.4398L149.143 83.5158C148.958 107.045 134.322 141.506 116.536 139.838C113.386 139.468 112.089 137.43 112.089 134.836C112.089 128.907 122.094 119.273 145.067 113.53C159.518 109.824 152.293 101.487 143.4 104.081C111.163 113.53 99.6759 127.425 99.6759 137.8C99.6759 145.026 105.605 150.584 113.942 150.955ZM194.72 109.454C214.359 109.454 239 95.3732 251.228 77.9577C250.301 82.96 246.596 96.8553 246.596 101.487C246.596 110.01 254.748 109.454 261.232 102.784L288.097 75.5491L290.32 85.7391C293.284 99.4491 299.213 104.822 308.847 104.822C326.263 104.822 342.196 85.7391 349.421 74.8081L344.049 63.6918C339.787 74.8081 321.631 92.5941 311.626 92.5941C306.994 92.5941 304.771 89.815 303.289 83.7011L300.325 71.2879C297.916 60.7275 289.023 58.3189 279.018 68.1383L261.788 84.8127L264.382 69.991C266.235 59.2453 255.674 58.1337 250.116 65.915C241.779 77.0313 216.767 97.7817 196.387 97.7817C187.865 97.7817 185.456 93.7057 185.456 88.3329C230.848 84.998 239.185 47.2027 208.986 47.2027C172.858 47.2027 157.11 109.454 194.72 109.454Z",fill:"currentColor"})})}),e.jsxs("p",{className:H.settingsVersion,children:["v","3.0.2"]}),e.jsx("button",{className:H.themeToggle,onClick:s,title:o?"Switch to light mode":"Switch to dark mode",children:e.jsx("span",{className:H.themeIconWrapper,children:e.jsx("span",{className:H.themeIcon,children:o?e.jsx(oi,{size:20}):e.jsx(si,{size:20})},o?"sun":"moon")})})]}),e.jsx("div",{className:H.divider}),e.jsxs("div",{className:H.settingsSection,children:[e.jsxs("div",{className:H.settingsRow,children:[e.jsxs("div",{className:H.settingsLabel,children:["Output Detail",e.jsx(dn,{content:"Controls how much detail is included in the copied output"})]}),e.jsxs("button",{className:H.cycleButton,onClick:()=>{const z=(Fn.findIndex(v=>v.value===t.outputDetail)+1)%Fn.length;n({outputDetail:Fn[z].value})},children:[e.jsx("span",{className:H.cycleButtonText,children:Fn.find(b=>b.value===t.outputDetail)?.label},t.outputDetail),e.jsx("span",{className:H.cycleDots,children:Fn.map(b=>e.jsx("span",{className:`${H.cycleDot} ${t.outputDetail===b.value?H.active:""}`},b.value))})]})]}),e.jsxs("div",{className:`${H.settingsRow} ${H.settingsRowMarginTop} ${r?"":H.settingsRowDisabled}`,children:[e.jsxs("div",{className:H.settingsLabel,children:["React Components",e.jsx(dn,{content:r?"Include React component names in annotations":"Disabled — production builds minify component names, making detection unreliable. Use in development mode."})]}),e.jsx(Ho,{checked:r&&t.reactEnabled,onChange:b=>n({reactEnabled:b.target.checked}),disabled:!r})]}),e.jsxs("div",{className:`${H.settingsRow} ${H.settingsRowMarginTop}`,children:[e.jsxs("div",{className:H.settingsLabel,children:["Hide Until Restart",e.jsx(dn,{content:"Hides the toolbar until you open a new tab"})]}),e.jsx(Ho,{checked:!1,onChange:b=>{b.target.checked&&R()}})]})]}),e.jsx("div",{className:H.divider}),e.jsxs("div",{className:H.settingsSection,children:[e.jsx("div",{className:`${H.settingsLabel} ${H.settingsLabelMarker}`,children:"Marker Color"}),e.jsx("div",{className:H.colorOptions,children:Hn.map(b=>e.jsx("button",{className:`${H.colorOption} ${t.annotationColorId===b.id?H.selected:""}`,style:{"--swatch":b.srgb,"--swatch-p3":b.p3},onClick:()=>n({annotationColorId:b.id}),title:b.label,type:"button"},b.id))})]}),e.jsx("div",{className:H.divider}),e.jsxs("div",{className:H.settingsSection,children:[e.jsx(Gs,{className:"checkbox-field",label:"Clear on copy/send",checked:t.autoClearAfterCopy,onChange:b=>n({autoClearAfterCopy:b.target.checked}),tooltip:"Automatically clear annotations after copying"}),e.jsx(Gs,{className:H.checkboxField,label:"Block page interactions",checked:t.blockInteractions,onChange:b=>n({blockInteractions:b.target.checked})})]}),e.jsx("div",{className:H.divider}),e.jsxs("button",{className:H.settingsNavLink,onClick:()=>f("automations"),children:[e.jsx("span",{children:"Manage MCP & Webhooks"}),e.jsxs("span",{className:H.settingsNavLinkRight,children:[_&&i!=="disconnected"&&e.jsx("span",{className:`${H.mcpNavIndicator} ${H[i]}`}),e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M7.5 12.5L12 8L7.5 3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]})]})]}),e.jsxs("div",{className:`${H.settingsPage} ${H.automationsPage} ${N==="automations"?H.slideIn:""}`,children:[e.jsxs("button",{className:H.settingsBackButton,onClick:()=>f("main"),children:[e.jsx(li,{size:16}),e.jsx("span",{children:"Manage MCP & Webhooks"})]}),e.jsx("div",{className:H.divider}),e.jsxs("div",{className:H.settingsSection,children:[e.jsxs("div",{className:H.settingsRow,children:[e.jsxs("span",{className:H.automationHeader,children:["MCP Connection",e.jsx(dn,{content:"Connect via Model Context Protocol to let AI agents like Claude Code receive annotations in real-time."})]}),_&&e.jsx("div",{className:`${H.mcpStatusDot} ${H[i]}`,title:i==="connected"?"Connected":i==="connecting"?"Connecting...":"Disconnected"})]}),e.jsxs("p",{className:H.automationDescription,style:{paddingBottom:6},children:["MCP connection allows agents to receive and act on annotations."," ",e.jsx("a",{href:"https://agentation.dev/mcp",target:"_blank",rel:"noopener noreferrer",className:H.learnMoreLink,children:"Learn more"})]})]}),e.jsx("div",{className:H.divider}),e.jsxs("div",{className:`${H.settingsSection} ${H.settingsSectionGrow}`,children:[e.jsxs("div",{className:H.settingsRow,children:[e.jsxs("span",{className:H.automationHeader,children:["Webhooks",e.jsx(dn,{content:"Send annotation data to any URL endpoint when annotations change. Useful for custom integrations."})]}),e.jsxs("div",{className:H.autoSendContainer,children:[e.jsx("label",{htmlFor:"agentation-auto-send",className:`${H.autoSendLabel} ${t.webhooksEnabled?H.active:""} ${t.webhookUrl?"":H.disabled}`,children:"Auto-Send"}),e.jsx(Ho,{id:"agentation-auto-send",checked:t.webhooksEnabled,onChange:b=>n({webhooksEnabled:b.target.checked}),disabled:!t.webhookUrl})]})]}),e.jsx("p",{className:H.automationDescription,children:"The webhook URL will receive live annotation changes and annotation data."}),e.jsx("textarea",{className:H.webhookUrlInput,placeholder:"Webhook URL",value:t.webhookUrl,onKeyDown:b=>b.stopPropagation(),onChange:b=>n({webhookUrl:b.target.value})})]})]})]})})}function Yo(t,n="filtered"){const{name:o,path:s}=jn(t);if(n==="off")return{name:o,elementName:o,path:s,reactComponents:null};const r=Ea(t,{mode:n});return{name:r.path?`${r.path} ${o}`:o,elementName:o,path:s,reactComponents:r.path}}var Zs=!1,Xo={outputDetail:"standard",autoClearAfterCopy:!1,annotationColorId:"blue",blockInteractions:!0,reactEnabled:!0,markerClickBehavior:"edit",webhookUrl:"",webhooksEnabled:!0},At=t=>{if(!t||!t.trim())return!1;try{const n=new URL(t.trim());return n.protocol==="http:"||n.protocol==="https:"}catch{return!1}},sc={compact:"off",standard:"filtered",detailed:"smart",forensic:"all"},Hn=[{id:"indigo",label:"Indigo",srgb:"#6155F5",p3:"color(display-p3 0.38 0.33 0.96)"},{id:"blue",label:"Blue",srgb:"#0088FF",p3:"color(display-p3 0.00 0.53 1.00)"},{id:"cyan",label:"Cyan",srgb:"#00C3D0",p3:"color(display-p3 0.00 0.76 0.82)"},{id:"green",label:"Green",srgb:"#34C759",p3:"color(display-p3 0.20 0.78 0.35)"},{id:"yellow",label:"Yellow",srgb:"#FFCC00",p3:"color(display-p3 1.00 0.80 0.00)"},{id:"orange",label:"Orange",srgb:"#FF8D28",p3:"color(display-p3 1.00 0.55 0.16)"},{id:"red",label:"Red",srgb:"#FF383C",p3:"color(display-p3 1.00 0.22 0.24)"}],rc=()=>{if(typeof document>"u"||document.getElementById("agentation-color-tokens"))return;const t=document.createElement("style");t.id="agentation-color-tokens",t.textContent=[...Hn.map(n=>`
      [data-agentation-accent="${n.id}"] {
        --agentation-color-accent: ${n.srgb};
      }

      @supports (color: color(display-p3 0 0 0)) {
        [data-agentation-accent="${n.id}"] {
          --agentation-color-accent: ${n.p3};
        }
      }
    `),`:root {
      ${Hn.map(n=>`--agentation-color-${n.id}: ${n.srgb};`).join(`
`)}
    }`,`@supports (color: color(display-p3 0 0 0)) {
      :root {
        ${Hn.map(n=>`--agentation-color-${n.id}: ${n.p3};`).join(`
`)}
      }
    }`].join(""),document.head.appendChild(t)};rc();function an(t,n){let o=document.elementFromPoint(t,n);if(!o)return null;for(;o?.shadowRoot;){const s=o.shadowRoot.elementFromPoint(t,n);if(!s||s===o)break;o=s}return o}function Uo(t){let n=t;for(;n&&n!==document.body;){const s=window.getComputedStyle(n).position;if(s==="fixed"||s==="sticky")return!0;n=n.parentElement}return!1}function cn(t){return t.status!=="resolved"&&t.status!=="dismissed"}function go(t){const n=Zo(t),o=n.found?n:Fa(t);if(o.found&&o.source)return za(o.source,"path")}function Rc({demoAnnotations:t,demoDelay:n=1e3,enableDemoMode:o=!1,onAnnotationAdd:s,onAnnotationDelete:r,onAnnotationUpdate:i,onAnnotationsClear:_,onCopy:y,onSubmit:g,copyToClipboard:N=!0,endpoint:f,sessionId:R,onSessionCreated:b,webhookUrl:z,className:v}={}){const[T,w]=c.useState(!1),[I,X]=c.useState([]),[ae,re]=c.useState(!0),[Ye,Xe]=c.useState(()=>fa()),[Q,Ve]=c.useState(!1),We=c.useRef(null);c.useEffect(()=>{const l=u=>{const h=We.current;h&&h.contains(u.target)&&u.stopPropagation()},d=["mousedown","click","pointerdown"];return d.forEach(u=>document.body.addEventListener(u,l)),()=>{d.forEach(u=>document.body.removeEventListener(u,l))}},[]);const[Me,ye]=c.useState(!1),[ze,Ue]=c.useState(!1),[xe,Se]=c.useState(null),[q,rt]=c.useState({x:0,y:0}),[P,ce]=c.useState(null),[Re,Je]=c.useState(!1),[gt,ut]=c.useState("idle"),[Yt,bt]=c.useState(!1),[Xt,Mt]=c.useState(!1),[Ot,Ut]=c.useState(null),[Qt,yt]=c.useState(null),[pt,wt]=c.useState([]),[$t,Vt]=c.useState(null),[zt,qt]=c.useState(null),[C,G]=c.useState(null),[pe,ie]=c.useState(null),[me,Be]=c.useState([]),[Ne,be]=c.useState(0),[Te,Ke]=c.useState(!1),[ee,p]=c.useState(!1),[x,M]=c.useState(!1),[L,V]=c.useState(!1),[A,B]=c.useState(!1),[ue,he]=c.useState("main"),[$e,Ae]=c.useState(!1),[Z,Le]=c.useState(!1),[Ie,ve]=c.useState(!1),[U,Oe]=c.useState([]),[ge,oe]=c.useState(null),De=c.useRef(!1),[we,vt]=c.useState(!1),[ft,xt]=c.useState(!1),[Bt,kt]=c.useState(1),[un,Xn]=c.useState("new-page"),[tt,Ft]=c.useState(""),[Un,pr]=c.useState(!1),[de,jt]=c.useState(null),xo=c.useRef(!1),bo=c.useRef({rearrange:null,placements:[]}),Jt=c.useRef({rearrange:null,placements:[]}),[fr,os]=c.useState(0),[yr,xr]=c.useState(0),[br,wo]=c.useState(0),[wr,ss]=c.useState(0),Sn=c.useRef(new Set),Qn=c.useRef(new Set),It=c.useRef(null),Vn=c.useRef(),rs=Z&&T&&!Ie&&we;c.useEffect(()=>{if(rs){xt(!1);const l=kn(()=>{xt(!0)});return()=>cancelAnimationFrame(l)}else xt(!1)},[rs]);const Mn=c.useRef(new Map),$n=c.useRef(new Map),In=c.useRef(),[Lt,vo]=c.useState(!1),[Ct,vr]=c.useState([]),kr=c.useRef(Ct);kr.current=Ct;const[is,ic]=c.useState(null),ko=c.useRef(null);c.useRef(!1),c.useRef([]),c.useRef(0),c.useRef(null),c.useRef(null),c.useRef(1);const[ls,as]=c.useState(!1),hn=c.useRef(null),[it,mn]=c.useState([]),Tt=c.useRef({cmd:!1,shift:!1}),_t=()=>{Ae(!0)},jr=()=>{Ae(!1)},Cr=()=>{ls||(hn.current=ne(()=>as(!0),850))},Sr=()=>{hn.current&&(clearTimeout(hn.current),hn.current=null),as(!1),jr()};c.useEffect(()=>()=>{hn.current&&clearTimeout(hn.current)},[]);const[ke,Mr]=c.useState(()=>{try{const l=JSON.parse(localStorage.getItem("feedback-toolbar-settings")??"");return{...Xo,...l,annotationColorId:Hn.find(d=>d.id===l.annotationColorId)?l.annotationColorId:Xo.annotationColorId}}catch{return Xo}}),[Dt,cs]=c.useState(!0),[ds,_s]=c.useState(!1),$r=()=>{We.current?.classList.add(E.disableTransitions),cs(l=>!l),kn(()=>{We.current?.classList.remove(E.disableTransitions)})},Ir=!0,en=ke.reactEnabled?sc[ke.outputDetail]:"off",[at,jo]=c.useState(R??null),us=c.useRef(!1),[Et,tn]=c.useState(f?"connecting":"disconnected"),[Ge,Co]=c.useState(null),[nn,hs]=c.useState(!1),[gn,ms]=c.useState(null),So=c.useRef(!1),[gs,Ln]=c.useState(new Set),[ps,qn]=c.useState(new Set),[En,Kn]=c.useState(!1),[Lr,pn]=c.useState(!1),[Ht,fs]=c.useState(!1),fn=c.useRef(null),Pt=c.useRef(null),Rn=c.useRef(null),Nn=c.useRef(null),Gn=c.useRef(!1),ys=c.useRef(0),Zn=c.useRef(null),xs=c.useRef(null),Mo=8,Er=50,bs=c.useRef(null),ws=c.useRef(null),Bn=c.useRef(null),se=typeof window<"u"?window.location.pathname:"/";c.useEffect(()=>{if(L)B(!0);else{Ae(!1),he("main");const l=ne(()=>B(!1),0);return()=>clearTimeout(l)}},[L]);const $o=T&&ae&&!Z;c.useEffect(()=>{if($o){Ue(!1),ye(!0),Ln(new Set);const l=ne(()=>{Ln(d=>{const u=new Set(d);return I.forEach(h=>u.add(h.id)),u})},350);return()=>clearTimeout(l)}else if(Me){Ue(!0);const l=ne(()=>{ye(!1),Ue(!1)},250);return()=>clearTimeout(l)}},[$o]),c.useEffect(()=>{p(!0),be(window.scrollY);const l=Wo(se);X(l.filter(cn)),Zs||(_s(!0),Zs=!0,ne(()=>_s(!1),750));try{const d=localStorage.getItem("feedback-toolbar-theme");d!==null&&cs(d==="dark")}catch{}try{const d=localStorage.getItem("feedback-toolbar-position");if(d){const u=JSON.parse(d);typeof u.x=="number"&&typeof u.y=="number"&&Co(u)}}catch{}},[se]),c.useEffect(()=>{ee&&localStorage.setItem("feedback-toolbar-settings",JSON.stringify(ke))},[ke,ee]),c.useEffect(()=>{ee&&localStorage.setItem("feedback-toolbar-theme",Dt?"dark":"light")},[Dt,ee]);const vs=c.useRef(!1);c.useEffect(()=>{const l=vs.current;vs.current=nn,l&&!nn&&Ge&&ee&&localStorage.setItem("feedback-toolbar-position",JSON.stringify(Ge))},[nn,Ge,ee]),c.useEffect(()=>{if(!f||!ee||us.current)return;us.current=!0,tn("connecting"),(async()=>{try{const d=ga(se),u=R||d;let h=!1;if(u)try{const m=await Hs(f,u);jo(m.id),tn("connected"),Ao(se,m.id),h=!0;const S=Wo(se),D=new Set(m.annotations.map(Y=>Y.id)),W=S.filter(Y=>!D.has(Y.id));if(W.length>0){const K=`${typeof window<"u"?window.location.origin:""}${se}`,_e=(await Promise.allSettled(W.map(te=>wn(f,m.id,{...te,sessionId:m.id,url:K})))).map((te,F)=>te.status==="fulfilled"?te.value:(console.warn("[Agentation] Failed to sync annotation:",te.reason),W[F])),Ce=[...m.annotations,..._e];X(Ce.filter(cn)),An(se,Ce.filter(cn),m.id)}else X(m.annotations.filter(cn)),An(se,m.annotations.filter(cn),m.id)}catch(m){console.warn("[Agentation] Could not join session, creating new:",m),pa(se)}if(!h){const m=typeof window<"u"?window.location.href:"/",S=await Oo(f,m);jo(S.id),tn("connected"),Ao(se,S.id),b?.(S.id);const D=la(),W=typeof window<"u"?window.location.origin:"",Y=[];for(const[K,J]of D){const _e=J.filter(F=>!F._syncedTo);if(_e.length===0)continue;const Ce=`${W}${K}`,te=K===se;Y.push((async()=>{try{const F=te?S:await Oo(f,Ce),ct=(await Promise.allSettled(_e.map(Fe=>wn(f,F.id,{...Fe,sessionId:F.id,url:Ce})))).map((Fe,ot)=>Fe.status==="fulfilled"?Fe.value:(console.warn("[Agentation] Failed to sync annotation:",Fe.reason),_e[ot])).filter(cn);if(An(K,ct,F.id),te){const Fe=new Set(_e.map(ot=>ot.id));X(ot=>{const le=ot.filter(fe=>!Fe.has(fe.id));return[...ct,...le]})}}catch(F){console.warn(`[Agentation] Failed to sync annotations for ${K}:`,F)}})())}await Promise.allSettled(Y)}}catch(d){tn("disconnected"),console.warn("[Agentation] Failed to initialize session, using local storage:",d)}})()},[f,R,ee,b,se]),c.useEffect(()=>{if(!f||!ee)return;const l=async()=>{try{(await fetch(`${f}/health`)).ok?tn("connected"):tn("disconnected")}catch{tn("disconnected")}};l();const d=di(l,1e4);return()=>clearInterval(d)},[f,ee]),c.useEffect(()=>{if(!f||!ee||!at)return;const l=new EventSource(`${f}/sessions/${at}/events`),d=["resolved","dismissed"],u=h=>{try{const m=JSON.parse(h.data);if(d.includes(m.payload?.status)){const S=m.payload.id,D=m.payload.kind;if(D==="placement"){for(const[W,Y]of Mn.current)if(Y===S){Mn.current.delete(W),Oe(K=>K.filter(J=>J.id!==W));break}}else if(D==="rearrange"){for(const[W,Y]of $n.current)if(Y===S){$n.current.delete(W),jt(K=>{if(!K)return null;const J=K.sections.filter(_e=>_e.id!==W);return J.length===0?null:{...K,sections:J}});break}}else qn(W=>new Set(W).add(S)),ne(()=>{X(W=>W.filter(Y=>Y.id!==S)),qn(W=>{const Y=new Set(W);return Y.delete(S),Y})},150)}}catch{}};return l.addEventListener("annotation.updated",u),()=>{l.removeEventListener("annotation.updated",u),l.close()}},[f,ee,at]),c.useEffect(()=>{if(!f||!ee)return;const l=xs.current==="disconnected",d=Et==="connected";xs.current=Et,l&&d&&(async()=>{try{const h=Wo(se);if(h.length===0)return;const S=`${typeof window<"u"?window.location.origin:""}${se}`;let D=at,W=[];if(D)try{W=(await Hs(f,D)).annotations}catch{D=null}D||(D=(await Oo(f,S)).id,jo(D),Ao(se,D));const Y=new Set(W.map(J=>J.id)),K=h.filter(J=>!Y.has(J.id));if(K.length>0){const _e=(await Promise.allSettled(K.map(F=>wn(f,D,{...F,sessionId:D,url:S})))).map((F,nt)=>F.status==="fulfilled"?F.value:(console.warn("[Agentation] Failed to sync annotation on reconnect:",F.reason),K[nt])),te=[...W,..._e].filter(cn);X(te),An(se,te,D)}}catch(h){console.warn("[Agentation] Failed to sync on reconnect:",h)}})()},[Et,f,ee,at,se]);const Rr=c.useCallback(()=>{Q||(Ve(!0),V(!1),w(!1),ne(()=>{ya(!0),Xe(!0),Ve(!1)},400))},[Q]);c.useEffect(()=>{if(!o||!ee||!t||t.length===0||I.length>0)return;const l=[];return l.push(ne(()=>{w(!0)},n-200)),t.forEach((d,u)=>{const h=n+u*300;l.push(ne(()=>{const m=document.querySelector(d.selector);if(!m)return;const S=m.getBoundingClientRect(),{name:D,path:W}=jn(m),Y={id:`demo-${Date.now()}-${u}`,x:(S.left+S.width/2)/window.innerWidth*100,y:S.top+S.height/2+window.scrollY,comment:d.comment,element:D,elementPath:W,timestamp:Date.now(),selectedText:d.selectedText,boundingBox:{x:S.left,y:S.top+window.scrollY,width:S.width,height:S.height},nearbyText:Pn(m),cssClasses:Wn(m)};X(K=>[...K,Y])},h))}),()=>{l.forEach(clearTimeout)}},[o,ee,t,n]),c.useEffect(()=>{const l=()=>{be(window.scrollY),Ke(!0),Bn.current&&clearTimeout(Bn.current),Bn.current=ne(()=>{Ke(!1)},150)};return window.addEventListener("scroll",l,{passive:!0}),()=>{window.removeEventListener("scroll",l),Bn.current&&clearTimeout(Bn.current)}},[]),c.useEffect(()=>{ee&&I.length>0?at?An(se,I,at):hr(se,I):ee&&I.length===0&&localStorage.removeItem(yo(se))},[I,se,ee,at]),c.useEffect(()=>{if(ee&&!De.current){De.current=!0;const l=aa(se);l.length>0&&Oe(l)}},[ee,se]),c.useEffect(()=>{ee&&De.current&&!we&&(U.length>0?ca(se,U):da(se))},[U,se,ee,we]),c.useEffect(()=>{if(ee&&!xo.current){xo.current=!0;const l=_a(se);if(l){const d={...l,sections:l.sections.map(u=>({...u,currentRect:u.currentRect??{...u.originalRect}}))};jt(d)}}},[ee,se]),c.useEffect(()=>{ee&&xo.current&&!we&&(de?ua(se,de):ha(se))},[de,se,ee,we]);const Io=c.useRef(!1);c.useEffect(()=>{if(ee&&!Io.current){Io.current=!0;const l=ma(se);l&&(Jt.current={rearrange:l.rearrange,placements:l.placements||[]},l.purpose&&Ft(l.purpose))}},[ee,se]),c.useEffect(()=>{if(!ee||!Io.current)return;const l=Jt.current;we?(de?.sections?.length??0)>0||U.length>0||tt?Fs(se,{rearrange:de,placements:U,purpose:tt}):uo(se):(l.rearrange?.sections?.length??0)>0||l.placements.length>0||tt?Fs(se,{rearrange:l.rearrange,placements:l.placements,purpose:tt}):uo(se)},[de,U,tt,we,se,ee]),c.useEffect(()=>{Z&&!de&&jt({sections:[],originalOrder:[],detectedAt:Date.now()})},[Z,de]),c.useEffect(()=>{if(!f||!at)return;const l=Mn.current,d=new Set(U.map(u=>u.id));for(const u of U){if(l.has(u.id))continue;l.set(u.id,"");const h=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:se;wn(f,at,{id:u.id,x:u.x/window.innerWidth*100,y:u.y,comment:`Place ${u.type} at (${Math.round(u.x)}, ${Math.round(u.y)}), ${u.width}×${u.height}px${u.text?` — "${u.text}"`:""}`,element:`[design:${u.type}]`,elementPath:"[placement]",timestamp:u.timestamp,url:h,intent:"change",severity:"important",kind:"placement",placement:{componentType:u.type,width:u.width,height:u.height,scrollY:u.scrollY,text:u.text}}).then(m=>{l.has(u.id)&&l.set(u.id,m.id)}).catch(m=>{console.warn("[Agentation] Failed to sync placement annotation:",m),l.delete(u.id)})}for(const[u,h]of l)d.has(u)||(l.delete(u),h&&Zt(f,h).catch(()=>{}))},[U,f,at,se]),c.useEffect(()=>{if(!(!f||!at))return In.current&&clearTimeout(In.current),In.current=ne(()=>{const l=$n.current;if(!de||de.sections.length===0){for(const[,h]of l)h&&Zt(f,h).catch(()=>{});l.clear();return}const d=new Set(de.sections.map(h=>h.id)),u=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:se;for(const h of de.sections){const m=h.originalRect,S=h.currentRect;if(!(Math.abs(m.x-S.x)>1||Math.abs(m.y-S.y)>1||Math.abs(m.width-S.width)>1||Math.abs(m.height-S.height)>1)){const Y=l.get(h.id);Y&&(l.delete(h.id),Zt(f,Y).catch(()=>{}));continue}const W=l.get(h.id);W?Ys(f,W,{comment:`Move ${h.label} section (${h.tagName}) — from (${Math.round(m.x)},${Math.round(m.y)}) ${Math.round(m.width)}×${Math.round(m.height)} to (${Math.round(S.x)},${Math.round(S.y)}) ${Math.round(S.width)}×${Math.round(S.height)}`}).catch(Y=>{console.warn("[Agentation] Failed to update rearrange annotation:",Y)}):(l.set(h.id,""),wn(f,at,{id:h.id,x:S.x/window.innerWidth*100,y:S.y,comment:`Move ${h.label} section (${h.tagName}) — from (${Math.round(m.x)},${Math.round(m.y)}) ${Math.round(m.width)}×${Math.round(m.height)} to (${Math.round(S.x)},${Math.round(S.y)}) ${Math.round(S.width)}×${Math.round(S.height)}`,element:h.selector,elementPath:"[rearrange]",timestamp:Date.now(),url:u,intent:"change",severity:"important",kind:"rearrange",rearrange:{selector:h.selector,label:h.label,tagName:h.tagName,originalRect:m,currentRect:S}}).then(Y=>{l.has(h.id)&&l.set(h.id,Y.id)}).catch(Y=>{console.warn("[Agentation] Failed to sync rearrange annotation:",Y),l.delete(h.id)}))}for(const[h,m]of l)d.has(h)||(l.delete(h),m&&Zt(f,m).catch(()=>{}))},300),()=>{In.current&&clearTimeout(In.current)}},[de,f,at,se]);const yn=c.useRef(new Map);c.useLayoutEffect(()=>{const l=de?.sections??[],d=new Set;if((Z||Ie)&&T)for(const u of l){d.add(u.id);try{const h=document.querySelector(u.selector);if(!h)continue;if(!yn.current.has(u.id)){const m={transform:h.style.transform,transformOrigin:h.style.transformOrigin,opacity:h.style.opacity,position:h.style.position,zIndex:h.style.zIndex,display:h.style.display},S=[];let D=h.parentElement;for(;D&&D!==document.body;){const Y=getComputedStyle(D);(Y.overflow!=="visible"||Y.overflowX!=="visible"||Y.overflowY!=="visible")&&(S.push({el:D,overflow:D.style.overflow}),D.style.overflow="visible"),D=D.parentElement}getComputedStyle(h).display==="inline"&&(h.style.display="inline-block"),yn.current.set(u.id,{el:h,origStyles:m,ancestors:S}),h.style.transformOrigin="top left",h.style.zIndex="9999"}}catch{}}for(const[u,h]of yn.current)if(!d.has(u)){const{el:m,origStyles:S,ancestors:D}=h;m.style.transition="transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",m.style.transform=S.transform,m.style.transformOrigin=S.transformOrigin,m.style.opacity=S.opacity,m.style.position=S.position,m.style.zIndex=S.zIndex,yn.current.delete(u),ne(()=>{m.style.transition="",m.style.display=S.display;for(const W of D)W.el.style.overflow=W.overflow},450)}},[de,Z,Ie,T]),c.useEffect(()=>()=>{for(const[,l]of yn.current){const{el:d,origStyles:u,ancestors:h}=l;d.style.transition="transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",d.style.transform=u.transform,d.style.transformOrigin=u.transformOrigin,d.style.opacity=u.opacity,d.style.position=u.position,d.style.zIndex=u.zIndex,ne(()=>{d.style.transition="",d.style.display=u.display;for(const m of h)m.el.style.overflow=m.overflow},450)}yn.current.clear()},[]);const Jn=c.useCallback(()=>{ve(!0),Le(!1),oe(null),clearTimeout(Vn.current),Vn.current=ne(()=>{ve(!1)},300)},[]),ks=c.useCallback(()=>{Z&&(ve(!0),Le(!1),oe(null),clearTimeout(Vn.current),Vn.current=ne(()=>{ve(!1)},300)),w(!1)},[Z]),js=c.useCallback(()=>{x||(ui(),M(!0))},[x]),eo=c.useCallback(()=>{x&&($s(),M(!1))},[x]),Lo=c.useCallback(()=>{x?eo():js()},[x,js,eo]),Cs=c.useCallback(()=>{if(it.length===0)return;const l=it[0],d=l.element,u=it.length>1,h=it.map(m=>m.element.getBoundingClientRect());if(u){const m={left:Math.min(...h.map(F=>F.left)),top:Math.min(...h.map(F=>F.top)),right:Math.max(...h.map(F=>F.right)),bottom:Math.max(...h.map(F=>F.bottom))},S=it.slice(0,5).map(F=>F.name).join(", "),D=it.length>5?` +${it.length-5} more`:"",W=h.map(F=>({x:F.left,y:F.top+window.scrollY,width:F.width,height:F.height})),K=it[it.length-1].element,J=h[h.length-1],_e=J.left+J.width/2,Ce=J.top+J.height/2,te=Uo(K);ce({x:_e/window.innerWidth*100,y:te?Ce:Ce+window.scrollY,clientY:Ce,element:`${it.length} elements: ${S}${D}`,elementPath:"multi-select",boundingBox:{x:m.left,y:m.top+window.scrollY,width:m.right-m.left,height:m.bottom-m.top},isMultiSelect:!0,isFixed:te,elementBoundingBoxes:W,multiSelectElements:it.map(F=>F.element),targetElement:K,fullPath:ao(d),accessibility:lo(d),computedStyles:io(d),computedStylesObj:ro(d),nearbyElements:so(d),cssClasses:Wn(d),nearbyText:Pn(d),sourceFile:go(d)})}else{const m=h[0],S=Uo(d);ce({x:m.left/window.innerWidth*100,y:S?m.top:m.top+window.scrollY,clientY:m.top,element:l.name,elementPath:l.path,boundingBox:{x:m.left,y:S?m.top:m.top+window.scrollY,width:m.width,height:m.height},isFixed:S,fullPath:ao(d),accessibility:lo(d),computedStyles:io(d),computedStylesObj:ro(d),nearbyElements:so(d),cssClasses:Wn(d),nearbyText:Pn(d),reactComponents:l.reactComponents,sourceFile:go(d)})}mn([]),Se(null)},[it]);c.useEffect(()=>{T||(ce(null),G(null),ie(null),Be([]),Se(null),V(!1),mn([]),Tt.current={cmd:!1,shift:!1},x&&eo())},[T,x,eo]),c.useEffect(()=>()=>{$s()},[]),c.useEffect(()=>{if(!T)return;const l=["p","span","h1","h2","h3","h4","h5","h6","li","td","th","label","blockquote","figcaption","caption","legend","dt","dd","pre","code","em","strong","b","i","u","s","a","time","address","cite","q","abbr","dfn","mark","small","sub","sup","[contenteditable]"].join(", "),d=":not([data-agentation-root]):not([data-agentation-root] *)",u=document.createElement("style");return u.id="feedback-cursor-styles",u.textContent=`
      body ${d} {
        cursor: crosshair !important;
      }

      body :is(${l})${d} {
        cursor: text !important;
      }
    `,document.head.appendChild(u),()=>{const h=document.getElementById("feedback-cursor-styles");h&&h.remove()}},[T]),c.useEffect(()=>{if(is!==null&&T)return document.documentElement.setAttribute("data-drawing-hover",""),()=>document.documentElement.removeAttribute("data-drawing-hover")},[is,T]),c.useEffect(()=>{if(!T||P||Lt||Z)return;const l=d=>{const u=d.composedPath()[0]||d.target;if(ht(u,"[data-feedback-toolbar]")){Se(null);return}const h=an(d.clientX,d.clientY);if(!h||ht(h,"[data-feedback-toolbar]")){Se(null);return}const{name:m,elementName:S,path:D,reactComponents:W}=Yo(h,en),Y=h.getBoundingClientRect();Se({element:m,elementName:S,elementPath:D,rect:Y,reactComponents:W}),rt({x:d.clientX,y:d.clientY})};return document.addEventListener("mousemove",l),()=>document.removeEventListener("mousemove",l)},[T,P,Lt,Z,en,Ct]);const to=c.useCallback(l=>{if(G(l),Ut(null),yt(null),wt([]),l.elementBoundingBoxes?.length){const d=[];for(const u of l.elementBoundingBoxes){const h=u.x+u.width/2,m=u.y+u.height/2-window.scrollY,S=an(h,m);S&&d.push(S)}Be(d),ie(null)}else if(l.boundingBox){const d=l.boundingBox,u=d.x+d.width/2,h=l.isFixed?d.y+d.height/2:d.y+d.height/2-window.scrollY,m=an(u,h);if(m){const S=m.getBoundingClientRect(),D=S.width/d.width,W=S.height/d.height;D<.5||W<.5?ie(null):ie(m)}else ie(null);Be([])}else ie(null),Be([])},[]);c.useEffect(()=>{if(!T||Lt||Z)return;const l=d=>{if(Gn.current){Gn.current=!1;return}const u=d.composedPath()[0]||d.target;if(ht(u,"[data-feedback-toolbar]")||ht(u,"[data-annotation-popup]")||ht(u,"[data-annotation-marker]"))return;if(d.metaKey&&d.shiftKey&&!P&&!C){d.preventDefault(),d.stopPropagation();const Qe=an(d.clientX,d.clientY);if(!Qe)return;const ct=Qe.getBoundingClientRect(),{name:Fe,path:ot,reactComponents:le}=Yo(Qe,en),fe=it.findIndex(Ze=>Ze.element===Qe);fe>=0?mn(Ze=>Ze.filter((et,Rt)=>Rt!==fe)):mn(Ze=>[...Ze,{element:Qe,rect:ct,name:Fe,path:ot,reactComponents:le??void 0}]);return}const h=ht(u,"button, a, input, select, textarea, [role='button'], [onclick]");if(ke.blockInteractions&&h&&(d.preventDefault(),d.stopPropagation()),P){if(h&&!ke.blockInteractions)return;d.preventDefault(),bs.current?.shake();return}if(C){if(h&&!ke.blockInteractions)return;d.preventDefault(),ws.current?.shake();return}d.preventDefault();const m=an(d.clientX,d.clientY);if(!m)return;const{name:S,path:D,reactComponents:W}=Yo(m,en),Y=m.getBoundingClientRect(),K=d.clientX/window.innerWidth*100,J=Uo(m),_e=J?d.clientY:d.clientY+window.scrollY,Ce=window.getSelection();let te;Ce&&Ce.toString().trim().length>0&&(te=Ce.toString().trim().slice(0,500));const F=ro(m),nt=io(m);ce({x:K,y:_e,clientY:d.clientY,element:S,elementPath:D,selectedText:te,boundingBox:{x:Y.left,y:J?Y.top:Y.top+window.scrollY,width:Y.width,height:Y.height},nearbyText:Pn(m),cssClasses:Wn(m),isFixed:J,fullPath:ao(m),accessibility:lo(m),computedStyles:nt,computedStylesObj:F,nearbyElements:so(m),reactComponents:W??void 0,sourceFile:go(m),targetElement:m}),Se(null)};return document.addEventListener("click",l,!0),()=>document.removeEventListener("click",l,!0)},[T,Lt,Z,P,C,ke.blockInteractions,en,it]),c.useEffect(()=>{if(!T)return;const l=h=>{h.key==="Meta"&&(Tt.current.cmd=!0),h.key==="Shift"&&(Tt.current.shift=!0)},d=h=>{const m=Tt.current.cmd&&Tt.current.shift;h.key==="Meta"&&(Tt.current.cmd=!1),h.key==="Shift"&&(Tt.current.shift=!1);const S=Tt.current.cmd&&Tt.current.shift;m&&!S&&it.length>0&&Cs()},u=()=>{Tt.current={cmd:!1,shift:!1},mn([])};return document.addEventListener("keydown",l),document.addEventListener("keyup",d),window.addEventListener("blur",u),()=>{document.removeEventListener("keydown",l),document.removeEventListener("keyup",d),window.removeEventListener("blur",u)}},[T,it,Cs]),c.useEffect(()=>{if(!T||P||Lt||Z)return;const l=d=>{const u=d.composedPath()[0]||d.target;ht(u,"[data-feedback-toolbar]")||ht(u,"[data-annotation-marker]")||ht(u,"[data-annotation-popup]")||new Set(["P","SPAN","H1","H2","H3","H4","H5","H6","LI","TD","TH","LABEL","BLOCKQUOTE","FIGCAPTION","CAPTION","LEGEND","DT","DD","PRE","CODE","EM","STRONG","B","I","U","S","A","TIME","ADDRESS","CITE","Q","ABBR","DFN","MARK","SMALL","SUB","SUP"]).has(u.tagName)||u.isContentEditable||(d.preventDefault(),fn.current={x:d.clientX,y:d.clientY})};return document.addEventListener("mousedown",l),()=>document.removeEventListener("mousedown",l)},[T,P,Lt,Z]),c.useEffect(()=>{if(!T||P)return;const l=d=>{if(!fn.current)return;const u=d.clientX-fn.current.x,h=d.clientY-fn.current.y,m=u*u+h*h,S=Mo*Mo;if(!Ht&&m>=S&&(Pt.current=fn.current,fs(!0),d.preventDefault()),(Ht||m>=S)&&Pt.current){if(Rn.current){const le=Math.min(Pt.current.x,d.clientX),fe=Math.min(Pt.current.y,d.clientY),Ze=Math.abs(d.clientX-Pt.current.x),et=Math.abs(d.clientY-Pt.current.y);Rn.current.style.transform=`translate(${le}px, ${fe}px)`,Rn.current.style.width=`${Ze}px`,Rn.current.style.height=`${et}px`}const D=Date.now();if(D-ys.current<Er)return;ys.current=D;const W=Pt.current.x,Y=Pt.current.y,K=Math.min(W,d.clientX),J=Math.min(Y,d.clientY),_e=Math.max(W,d.clientX),Ce=Math.max(Y,d.clientY),te=(K+_e)/2,F=(J+Ce)/2,nt=new Set,Qe=[[K,J],[_e,J],[K,Ce],[_e,Ce],[te,F],[te,J],[te,Ce],[K,F],[_e,F]];for(const[le,fe]of Qe){const Ze=document.elementsFromPoint(le,fe);for(const et of Ze)et instanceof HTMLElement&&nt.add(et)}const ct=document.querySelectorAll("button, a, input, img, p, h1, h2, h3, h4, h5, h6, li, label, td, th, div, span, section, article, aside, nav");for(const le of ct)if(le instanceof HTMLElement){const fe=le.getBoundingClientRect(),Ze=fe.left+fe.width/2,et=fe.top+fe.height/2,Rt=Ze>=K&&Ze<=_e&&et>=J&&et<=Ce,St=Math.min(fe.right,_e)-Math.max(fe.left,K),dt=Math.min(fe.bottom,Ce)-Math.max(fe.top,J),Dn=St>0&&dt>0?St*dt:0,sn=fe.width*fe.height,Kt=sn>0?Dn/sn:0;(Rt||Kt>.5)&&nt.add(le)}const Fe=[],ot=new Set(["BUTTON","A","INPUT","IMG","P","H1","H2","H3","H4","H5","H6","LI","LABEL","TD","TH","SECTION","ARTICLE","ASIDE","NAV"]);for(const le of nt){if(ht(le,"[data-feedback-toolbar]")||ht(le,"[data-annotation-marker]"))continue;const fe=le.getBoundingClientRect();if(!(fe.width>window.innerWidth*.8&&fe.height>window.innerHeight*.5)&&!(fe.width<10||fe.height<10)&&fe.left<_e&&fe.right>K&&fe.top<Ce&&fe.bottom>J){const Ze=le.tagName;let et=ot.has(Ze);if(!et&&(Ze==="DIV"||Ze==="SPAN")){const Rt=le.textContent&&le.textContent.trim().length>0,St=le.onclick!==null||le.getAttribute("role")==="button"||le.getAttribute("role")==="link"||le.classList.contains("clickable")||le.hasAttribute("data-clickable");(Rt||St)&&!le.querySelector("p, h1, h2, h3, h4, h5, h6, button, a")&&(et=!0)}if(et){let Rt=!1;for(const St of Fe)if(St.left<=fe.left&&St.right>=fe.right&&St.top<=fe.top&&St.bottom>=fe.bottom){Rt=!0;break}Rt||Fe.push(fe)}}}if(Nn.current){const le=Nn.current;for(;le.children.length>Fe.length;)le.removeChild(le.lastChild);Fe.forEach((fe,Ze)=>{let et=le.children[Ze];et||(et=document.createElement("div"),et.className=E.selectedElementHighlight,le.appendChild(et)),et.style.transform=`translate(${fe.left}px, ${fe.top}px)`,et.style.width=`${fe.width}px`,et.style.height=`${fe.height}px`})}}};return document.addEventListener("mousemove",l,{passive:!0}),()=>document.removeEventListener("mousemove",l)},[T,P,Ht,Mo]),c.useEffect(()=>{if(!T)return;const l=d=>{const u=Ht,h=Pt.current;if(Ht&&h){Gn.current=!0;const m=Math.min(h.x,d.clientX),S=Math.min(h.y,d.clientY),D=Math.max(h.x,d.clientX),W=Math.max(h.y,d.clientY),Y=[];document.querySelectorAll("button, a, input, img, p, h1, h2, h3, h4, h5, h6, li, label, td, th").forEach(te=>{if(!(te instanceof HTMLElement)||ht(te,"[data-feedback-toolbar]")||ht(te,"[data-annotation-marker]"))return;const F=te.getBoundingClientRect();F.width>window.innerWidth*.8&&F.height>window.innerHeight*.5||F.width<10||F.height<10||F.left<D&&F.right>m&&F.top<W&&F.bottom>S&&Y.push({element:te,rect:F})});const J=Y.filter(({element:te})=>!Y.some(({element:F})=>F!==te&&te.contains(F))),_e=d.clientX/window.innerWidth*100,Ce=d.clientY+window.scrollY;if(J.length>0){const te=J.reduce((ot,{rect:le})=>({left:Math.min(ot.left,le.left),top:Math.min(ot.top,le.top),right:Math.max(ot.right,le.right),bottom:Math.max(ot.bottom,le.bottom)}),{left:1/0,top:1/0,right:-1/0,bottom:-1/0}),F=J.slice(0,5).map(({element:ot})=>jn(ot).name).join(", "),nt=J.length>5?` +${J.length-5} more`:"",Qe=J[0].element,ct=ro(Qe),Fe=io(Qe);ce({x:_e,y:Ce,clientY:d.clientY,element:`${J.length} elements: ${F}${nt}`,elementPath:"multi-select",boundingBox:{x:te.left,y:te.top+window.scrollY,width:te.right-te.left,height:te.bottom-te.top},isMultiSelect:!0,fullPath:ao(Qe),accessibility:lo(Qe),computedStyles:Fe,computedStylesObj:ct,nearbyElements:so(Qe),cssClasses:Wn(Qe),nearbyText:Pn(Qe),sourceFile:go(Qe)})}else{const te=Math.abs(D-m),F=Math.abs(W-S);te>20&&F>20&&ce({x:_e,y:Ce,clientY:d.clientY,element:"Area selection",elementPath:`region at (${Math.round(m)}, ${Math.round(S)})`,boundingBox:{x:m,y:S+window.scrollY,width:te,height:F},isMultiSelect:!0})}Se(null)}else u&&(Gn.current=!0);fn.current=null,Pt.current=null,fs(!1),Nn.current&&(Nn.current.innerHTML="")};return document.addEventListener("mouseup",l),()=>document.removeEventListener("mouseup",l)},[T,Ht]);const Wt=c.useCallback(async(l,d,u)=>{const h=ke.webhookUrl||z;if(!h||!ke.webhooksEnabled&&!u)return!1;try{return(await fetch(h,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:l,timestamp:Date.now(),url:typeof window<"u"?window.location.href:void 0,...d})})).ok}catch(m){return console.warn("[Agentation] Webhook failed:",m),!1}},[z,ke.webhookUrl,ke.webhooksEnabled]),Nr=c.useCallback(l=>{if(!P)return;const d={id:Date.now().toString(),x:P.x,y:P.y,comment:l,element:P.element,elementPath:P.elementPath,timestamp:Date.now(),selectedText:P.selectedText,boundingBox:P.boundingBox,nearbyText:P.nearbyText,cssClasses:P.cssClasses,isMultiSelect:P.isMultiSelect,isFixed:P.isFixed,fullPath:P.fullPath,accessibility:P.accessibility,computedStyles:P.computedStyles,nearbyElements:P.nearbyElements,reactComponents:P.reactComponents,sourceFile:P.sourceFile,elementBoundingBoxes:P.elementBoundingBoxes,...f&&at?{sessionId:at,url:typeof window<"u"?window.location.href:void 0,status:"pending"}:{}};X(u=>[...u,d]),Zn.current=d.id,ne(()=>{Zn.current=null},300),ne(()=>{Ln(u=>new Set(u).add(d.id))},250),s?.(d),Wt("annotation.add",{annotation:d}),Kn(!0),ne(()=>{ce(null),Kn(!1)},150),window.getSelection()?.removeAllRanges(),f&&at&&wn(f,at,d).then(u=>{u.id!==d.id&&(X(h=>h.map(m=>m.id===d.id?{...m,id:u.id}:m)),Ln(h=>{const m=new Set(h);return m.delete(d.id),m.add(u.id),m}))}).catch(u=>{console.warn("[Agentation] Failed to sync annotation:",u)})},[P,s,Wt,f,at]),Eo=c.useCallback(()=>{Kn(!0),ne(()=>{ce(null),Kn(!1)},150)},[]),Ro=c.useCallback(l=>{const d=I.findIndex(h=>h.id===l),u=I[d];C?.id===l&&(pn(!0),ne(()=>{G(null),ie(null),Be([]),pn(!1)},150)),Vt(l),qn(h=>new Set(h).add(l)),u&&(r?.(u),Wt("annotation.delete",{annotation:u})),f&&Zt(f,l).catch(h=>{console.warn("[Agentation] Failed to delete annotation from server:",h)}),ne(()=>{X(h=>h.filter(m=>m.id!==l)),qn(h=>{const m=new Set(h);return m.delete(l),m}),Vt(null),d<I.length-1&&(qt(d),ne(()=>qt(null),200))},150)},[I,C,r,Wt,f]),no=c.useCallback(l=>{if(!l){Ut(null),yt(null),wt([]);return}if(Ut(l.id),l.elementBoundingBoxes?.length){const d=[];for(const u of l.elementBoundingBoxes){const h=u.x+u.width/2,m=u.y+u.height/2-window.scrollY,D=document.elementsFromPoint(h,m).find(W=>!W.closest("[data-annotation-marker]")&&!W.closest("[data-agentation-root]"));D&&d.push(D)}wt(d),yt(null)}else if(l.boundingBox){const d=l.boundingBox,u=d.x+d.width/2,h=l.isFixed?d.y+d.height/2:d.y+d.height/2-window.scrollY,m=an(u,h);if(m){const S=m.getBoundingClientRect(),D=S.width/d.width,W=S.height/d.height;D<.5||W<.5?yt(null):yt(m)}else yt(null);wt([])}else yt(null),wt([])},[]),Br=c.useCallback(l=>{if(!C)return;const d={...C,comment:l};X(u=>u.map(h=>h.id===C.id?d:h)),i?.(d),Wt("annotation.update",{annotation:d}),f&&Ys(f,C.id,{comment:l}).catch(u=>{console.warn("[Agentation] Failed to update annotation on server:",u)}),pn(!0),ne(()=>{G(null),ie(null),Be([]),pn(!1)},150)},[C,i,Wt,f]),Tr=c.useCallback(()=>{pn(!0),ne(()=>{G(null),ie(null),Be([]),pn(!1)},150)},[]),on=c.useCallback(()=>{const l=I.length,d=U.length>0||!!de;if(l===0&&Ct.length===0&&!d)return;if(_?.(I),Wt("annotations.clear",{annotations:I}),f){Promise.all(I.map(m=>Zt(f,m.id).catch(S=>{console.warn("[Agentation] Failed to delete annotation from server:",S)})));for(const[,m]of Mn.current)m&&Zt(f,m).catch(()=>{});Mn.current.clear();for(const[,m]of $n.current)m&&Zt(f,m).catch(()=>{});$n.current.clear()}Mt(!0),bt(!0),vr([]);const u=ko.current;if(u){const m=u.getContext("2d");m&&m.clearRect(0,0,u.width,u.height)}(U.length>0||de)&&(wo(m=>m+1),ss(m=>m+1),ne(()=>{Oe([]),jt(null)},200)),we&&vt(!1),tt&&Ft(""),Jt.current={rearrange:null,placements:[]},uo(se);const h=l*30+200;ne(()=>{X([]),Ln(new Set),localStorage.removeItem(yo(se)),Mt(!1)},h),ne(()=>bt(!1),1500)},[se,I,Ct,U,de,we,tt,_,Wt,f]),No=c.useCallback(async()=>{const l=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:se,d=Z&&we;let u;if(d){if(U.length===0&&!de&&!tt)return;u=""}else{if(u=Qs(I,l,ke.outputDetail),!u&&Ct.length===0&&U.length===0&&!de)return;u||(u=`## Page Feedback: ${l}
`)}if(!d&&Ct.length>0){const h=new Set;for(const W of I)W.drawingIndex!=null&&h.add(W.drawingIndex);const m=ko.current;m&&(m.style.visibility="hidden");const S=[],D=window.scrollY;for(let W=0;W<Ct.length;W++){if(h.has(W))continue;const Y=Ct[W];if(Y.points.length<2)continue;const K=Y.fixed?Y.points:Y.points.map(lt=>({x:lt.x,y:lt.y-D}));let J=1/0,_e=1/0,Ce=-1/0,te=-1/0;for(const lt of K)J=Math.min(J,lt.x),_e=Math.min(_e,lt.y),Ce=Math.max(Ce,lt.x),te=Math.max(te,lt.y);const F=Ce-J,nt=te-_e,Qe=Math.hypot(F,nt),ct=K[0],Fe=K[K.length-1],ot=Math.hypot(Fe.x-ct.x,Fe.y-ct.y);let le;const fe=ot<Qe*.35,Ze=F/Math.max(nt,1);if(fe&&Qe>20){const lt=Math.max(F,nt)*.15;let Gt=0;for(const rn of K){const Wr=rn.x-J<lt,Ar=Ce-rn.x<lt,Or=rn.y-_e<lt,zr=te-rn.y<lt;(Wr||Ar)&&(Or||zr)&&Gt++}le=Gt>K.length*.15?"box":"circle"}else Ze>3&&nt<40?le="underline":ot>Qe*.5?le="arrow":le="drawing";const et=Math.min(10,K.length),Rt=Math.max(1,Math.floor(K.length/et)),St=new Set,dt=[],Dn=[ct];for(let lt=Rt;lt<K.length-1;lt+=Rt)Dn.push(K[lt]);Dn.push(Fe);for(const lt of Dn){const Gt=an(lt.x,lt.y);if(!Gt||St.has(Gt)||ht(Gt,"[data-feedback-toolbar]"))continue;St.add(Gt);const{name:rn}=jn(Gt);dt.includes(rn)||dt.push(rn)}const sn=`${Math.round(J)},${Math.round(_e)} → ${Math.round(Ce)},${Math.round(te)}`;let Kt;(le==="circle"||le==="box")&&dt.length>0?Kt=`${le==="box"?"Boxed":"Circled"} **${dt[0]}**${dt.length>1?` (and ${dt.slice(1).join(", ")})`:""} (region: ${sn})`:le==="underline"&&dt.length>0?Kt=`Underlined **${dt[0]}** (${sn})`:le==="arrow"&&dt.length>=2?Kt=`Arrow from **${dt[0]}** to **${dt[dt.length-1]}** (${Math.round(ct.x)},${Math.round(ct.y)} → ${Math.round(Fe.x)},${Math.round(Fe.y)})`:dt.length>0?Kt=`${le==="arrow"?"Arrow":"Drawing"} near **${dt.join("**, **")}** (region: ${sn})`:Kt=`Drawing at ${sn}`,S.push(Kt)}m&&(m.style.visibility=""),S.length>0&&(u+=`
**Drawings:**
`,S.forEach((W,Y)=>{u+=`${Y+1}. ${W}
`}))}if((U.length>0||d&&tt)&&(u+=`
`+Os(U,{width:window.innerWidth,height:window.innerHeight},{blankCanvas:we,wireframePurpose:tt||void 0},ke.outputDetail)),de){const h=zs(de,ke.outputDetail,{width:window.innerWidth,height:window.innerHeight});h&&(u+=`
`+h)}if(N)try{await navigator.clipboard.writeText(u)}catch{}y?.(u),Je(!0),ne(()=>Je(!1),2e3),ke.autoClearAfterCopy&&ne(()=>on(),500)},[I,Ct,U,de,we,Z,un,tt,se,ke.outputDetail,en,ke.autoClearAfterCopy,on,N,y]),Bo=c.useCallback(async()=>{const l=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:se;let d=Qs(I,l,ke.outputDetail);if(!d&&U.length===0&&!de)return;if(d||(d=`## Page Feedback: ${l}
`),U.length>0&&(d+=`
`+Os(U,{width:window.innerWidth,height:window.innerHeight},{blankCanvas:we,wireframePurpose:tt||void 0},ke.outputDetail)),de){const h=zs(de,ke.outputDetail,{width:window.innerWidth,height:window.innerHeight});h&&(d+=`
`+h)}g&&g(d,I),ut("sending"),await new Promise(h=>ne(h,150));const u=await Wt("submit",{output:d,annotations:I},!0);ut(u?"sent":"failed"),ne(()=>ut("idle"),2500),u&&ke.autoClearAfterCopy&&ne(()=>on(),500)},[g,Wt,I,U,de,we,un,se,ke.outputDetail,en,ke.autoClearAfterCopy,on]);c.useEffect(()=>{if(!gn)return;const l=10,d=h=>{const m=h.clientX-gn.x,S=h.clientY-gn.y,D=Math.sqrt(m*m+S*S);if(!nn&&D>l&&hs(!0),nn||D>l){let W=gn.toolbarX+m,Y=gn.toolbarY+S;const K=20,J=337,_e=44,te=J-(T?Et==="connected"?297:257:44),F=K-te,nt=window.innerWidth-K-J;W=Math.max(F,Math.min(nt,W)),Y=Math.max(K,Math.min(window.innerHeight-_e-K,Y)),Co({x:W,y:Y})}},u=()=>{nn&&(So.current=!0),hs(!1),ms(null)};return document.addEventListener("mousemove",d),document.addEventListener("mouseup",u),()=>{document.removeEventListener("mousemove",d),document.removeEventListener("mouseup",u)}},[gn,nn,T,Et]);const Dr=c.useCallback(l=>{if(l.target.closest("button")||l.target.closest("[data-agentation-settings-panel]"))return;const d=l.currentTarget.parentElement;if(!d)return;const u=d.getBoundingClientRect(),h=Ge?.x??u.left,m=Ge?.y??u.top;ms({x:l.clientX,y:l.clientY,toolbarX:h,toolbarY:m})},[Ge]);if(c.useEffect(()=>{if(!Ge)return;const l=()=>{let m=Ge.x,S=Ge.y;const Y=20-(337-(T?Et==="connected"?297:257:44)),K=window.innerWidth-20-337;m=Math.max(Y,Math.min(K,m)),S=Math.max(20,Math.min(window.innerHeight-44-20,S)),(m!==Ge.x||S!==Ge.y)&&Co({x:m,y:S})};return l(),window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[Ge,T,Et]),c.useEffect(()=>{const l=d=>{const u=d.target,h=u.tagName==="INPUT"||u.tagName==="TEXTAREA"||u.isContentEditable;if(d.key==="Escape"){if(Z){ge?oe(null):Jn();return}if(Lt){vo(!1);return}if(it.length>0){mn([]);return}P||T&&(_t(),w(!1))}if((d.metaKey||d.ctrlKey)&&d.shiftKey&&(d.key==="f"||d.key==="F")){d.preventDefault(),_t(),T?ks():w(!0);return}if(!(h||d.metaKey||d.ctrlKey)&&((d.key==="p"||d.key==="P")&&(d.preventDefault(),_t(),Lo()),(d.key==="l"||d.key==="L")&&(d.preventDefault(),_t(),Lt&&vo(!1),L&&V(!1),P&&Eo(),Z?Jn():Le(!0)),(d.key==="h"||d.key==="H")&&I.length>0&&(d.preventDefault(),_t(),re(m=>!m)),(d.key==="c"||d.key==="C")&&(I.length>0||U.length>0||de)&&(d.preventDefault(),_t(),No()),(d.key==="x"||d.key==="X")&&(I.length>0||U.length>0||de)&&(d.preventDefault(),_t(),on(),U.length>0&&Oe([]),de&&jt(null)),d.key==="s"||d.key==="S")){const m=At(ke.webhookUrl)||At(z||"");I.length>0&&m&&gt==="idle"&&(d.preventDefault(),_t(),Bo())}};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[T,Lt,Z,ge,U,de,P,I.length,ke.webhookUrl,z,gt,Bo,Lo,No,on,it]),!ee||Ye)return null;const Tn=I.length>0,xn=I.filter(l=>!ps.has(l.id)&&l.kind!=="placement"&&l.kind!=="rearrange"),Pr=xn.length>0,Ss=I.filter(l=>ps.has(l.id)),Ms=l=>{const S=l.x/100*window.innerWidth,D=typeof l.y=="string"?parseFloat(l.y):l.y,W={};window.innerHeight-D-22-10<80&&(W.top="auto",W.bottom="calc(100% + 10px)");const K=S-200/2,J=10;if(K<J){const _e=J-K;W.left=`calc(50% + ${_e}px)`}else if(K+200>window.innerWidth-J){const _e=K+200-(window.innerWidth-J);W.left=`calc(50% - ${_e}px)`}return W};return Js.createPortal(e.jsxs("div",{ref:We,style:{display:"contents"},"data-agentation-theme":Dt?"dark":"light","data-agentation-accent":ke.annotationColorId,"data-agentation-root":"",children:[e.jsx("div",{className:`${E.toolbar}${v?` ${v}`:""}`,"data-feedback-toolbar":!0,"data-agentation-toolbar":!0,style:Ge?{left:Ge.x,top:Ge.y,right:"auto",bottom:"auto"}:void 0,children:e.jsxs("div",{className:`${E.toolbarContainer} ${T?E.expanded:E.collapsed} ${ds?E.entrance:""} ${Q?E.hiding:""} ${!ke.webhooksEnabled&&(At(ke.webhookUrl)||At(z||""))?E.serverConnected:""}`,onClick:T?void 0:l=>{if(So.current){So.current=!1,l.preventDefault();return}w(!0)},onMouseDown:Dr,role:T?void 0:"button",tabIndex:T?-1:0,title:T?void 0:"Start feedback mode",children:[e.jsxs("div",{className:`${E.toggleContent} ${T?E.hidden:E.visible}`,children:[e.jsx(Vr,{size:24}),Pr&&e.jsx("span",{className:`${E.badge} ${T?E.fadeOut:""} ${ds?E.entrance:""}`,children:xn.length})]}),e.jsxs("div",{className:`${E.controlsContent} ${T?E.visible:E.hidden} ${Ge&&Ge.y<100?E.tooltipBelow:""} ${$e||L?E.tooltipsHidden:""} ${ls?E.tooltipsInSession:""}`,onMouseEnter:Cr,onMouseLeave:Sr,children:[e.jsxs("div",{className:`${E.buttonWrapper} ${Ge&&Ge.x<120?E.buttonWrapperAlignLeft:""}`,children:[e.jsx("button",{className:E.controlButton,onClick:l=>{l.stopPropagation(),_t(),Lo()},"data-active":x,children:e.jsx(Jr,{size:24,isPaused:x})}),e.jsxs("span",{className:E.buttonTooltip,children:[x?"Resume animations":"Pause animations",e.jsx("span",{className:E.shortcut,children:"P"})]})]}),e.jsxs("div",{className:E.buttonWrapper,children:[e.jsx("button",{className:`${E.controlButton} ${Dt?"":E.light}`,onClick:l=>{l.stopPropagation(),_t(),Lt&&vo(!1),L&&V(!1),P&&Eo(),Z?Jn():Le(!0)},"data-active":Z,style:Z&&we?{color:"#f97316",background:"rgba(249, 115, 22, 0.25)"}:void 0,children:e.jsx(ai,{size:21})}),e.jsxs("span",{className:E.buttonTooltip,children:[Z?"Exit layout mode":"Layout mode",e.jsx("span",{className:E.shortcut,children:"L"})]})]}),e.jsxs("div",{className:E.buttonWrapper,children:[e.jsx("button",{className:E.controlButton,onClick:l=>{l.stopPropagation(),_t(),re(!ae)},disabled:!Tn||Z,children:e.jsx(Zr,{size:24,isOpen:ae})}),e.jsxs("span",{className:E.buttonTooltip,children:[ae?"Hide markers":"Show markers",e.jsx("span",{className:E.shortcut,children:"H"})]})]}),e.jsxs("div",{className:E.buttonWrapper,children:[e.jsx("button",{className:`${E.controlButton} ${Re?E.statusShowing:""}`,onClick:l=>{l.stopPropagation(),_t(),No()},disabled:Z&&we?U.length===0&&!de?.sections?.length:!Tn&&Ct.length===0&&U.length===0&&!de?.sections?.length,"data-active":Re,children:e.jsx(Kr,{size:24,copied:Re,tint:Z&&we&&(U.length>0||de?.sections?.length)?"#f97316":void 0})}),e.jsxs("span",{className:E.buttonTooltip,children:[Z&&we?"Copy layout":"Copy feedback",e.jsx("span",{className:E.shortcut,children:"C"})]})]}),e.jsxs("div",{className:`${E.buttonWrapper} ${E.sendButtonWrapper} ${T&&!ke.webhooksEnabled&&(At(ke.webhookUrl)||At(z||""))?E.sendButtonVisible:""}`,children:[e.jsxs("button",{className:`${E.controlButton} ${gt==="sent"||gt==="failed"?E.statusShowing:""}`,onClick:l=>{l.stopPropagation(),_t(),Bo()},disabled:!Tn||!At(ke.webhookUrl)&&!At(z||"")||gt==="sending","data-no-hover":gt==="sent"||gt==="failed",tabIndex:At(ke.webhookUrl)||At(z||"")?0:-1,children:[e.jsx(Gr,{size:24,state:gt}),Tn&&gt==="idle"&&e.jsx("span",{className:E.buttonBadge,children:I.length})]}),e.jsxs("span",{className:E.buttonTooltip,children:["Send Annotations",e.jsx("span",{className:E.shortcut,children:"S"})]})]}),e.jsxs("div",{className:E.buttonWrapper,children:[e.jsx("button",{className:E.controlButton,onClick:l=>{l.stopPropagation(),_t(),on()},disabled:!Tn&&Ct.length===0&&U.length===0&&!de?.sections?.length,"data-danger":!0,children:e.jsx(ti,{size:24})}),e.jsxs("span",{className:E.buttonTooltip,children:["Clear all",e.jsx("span",{className:E.shortcut,children:"X"})]})]}),e.jsxs("div",{className:E.buttonWrapper,children:[e.jsx("button",{className:E.controlButton,onClick:l=>{l.stopPropagation(),_t(),Z&&Jn(),V(!L)},children:e.jsx(ei,{size:24})}),f&&Et!=="disconnected"&&e.jsx("span",{className:`${E.mcpIndicator} ${E[Et]} ${L?E.hidden:""}`,title:Et==="connected"?"MCP Connected":"MCP Connecting..."}),e.jsx("span",{className:E.buttonTooltip,children:"Settings"})]}),e.jsx("div",{className:E.divider}),e.jsxs("div",{className:`${E.buttonWrapper} ${Ge&&typeof window<"u"&&Ge.x>window.innerWidth-120?E.buttonWrapperAlignRight:""}`,children:[e.jsx("button",{className:E.controlButton,onClick:l=>{l.stopPropagation(),_t(),ks()},children:e.jsx(ni,{size:24})}),e.jsxs("span",{className:E.buttonTooltip,children:["Exit",e.jsx("span",{className:E.shortcut,children:"Esc"})]})]})]}),e.jsx(Pl,{visible:Z&&T,activeType:ge,onSelect:l=>{oe(ge===l?null:l)},isDarkMode:Dt,sectionCount:de?.sections.length??0,onDetectSections:()=>{const l=Vl(),d=de?.sections??[],u=new Set(d.map(D=>D.selector)),h=l.filter(D=>!u.has(D.selector)),m=[...d,...h],S=[...de?.originalOrder??[],...h.map(D=>D.id)];jt({sections:m,originalOrder:S,detectedAt:Date.now()})},placementCount:U.length,onClearPlacements:()=>{wo(l=>l+1),ss(l=>l+1),ne(()=>{jt({sections:[],originalOrder:[],detectedAt:Date.now()})},200)},blankCanvas:we,onBlankCanvasChange:l=>{const d={sections:[],originalOrder:[],detectedAt:Date.now()};l?(bo.current={rearrange:de,placements:U},jt(Jt.current.rearrange||d),Oe(Jt.current.placements),oe(null)):(Jt.current={rearrange:de,placements:U},jt(bo.current.rearrange||d),Oe(bo.current.placements)),vt(l)},wireframePurpose:tt,onWireframePurposeChange:Ft,Tooltip:dn,onDragStart:(l,d)=>{d.preventDefault();const u=O[l];let h=null,m=!1;const S=d.clientX,D=d.clientY,Y=d.target.closest("[data-feedback-toolbar]")?.getBoundingClientRect().top??window.innerHeight,K=_e=>{const Ce=_e.clientX-S,te=_e.clientY-D;if(!m&&(Math.abs(Ce)>4||Math.abs(te)>4)&&(m=!0,h=document.createElement("div"),h.className=`${j.dragPreview}${we?` ${j.dragPreviewWireframe}`:""}`,document.body.appendChild(h)),!h)return;const F=Math.max(0,Y-_e.clientY),nt=Math.min(1,F/180),Qe=1-Math.pow(1-nt,2),ct=28,Fe=20,ot=Math.min(140,u.width*.18),le=Math.min(90,u.height*.18),fe=ct+(ot-ct)*Qe,Ze=Fe+(le-Fe)*Qe;h.style.width=`${fe}px`,h.style.height=`${Ze}px`,h.style.left=`${_e.clientX-fe/2}px`,h.style.top=`${_e.clientY-Ze/2}px`,h.style.opacity=`${.5+.5*Qe}`,h.textContent=Qe>.25?l:""},J=_e=>{if(window.removeEventListener("mousemove",K),window.removeEventListener("mouseup",J),h&&document.body.removeChild(h),m){const Ce=u.width,te=u.height,F=window.scrollY,nt=Math.max(0,_e.clientX-Ce/2),Qe=Math.max(0,_e.clientY+F-te/2),ct={id:`dp-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type:l,x:nt,y:Qe,width:Ce,height:te,scrollY:F,timestamp:Date.now()};Oe(Fe=>[...Fe,ct]),oe(null),Sn.current=new Set,os(Fe=>Fe+1)}};window.addEventListener("mousemove",K),window.addEventListener("mouseup",J)}}),e.jsx(oc,{settings:ke,onSettingsChange:l=>Mr(d=>({...d,...l})),isDarkMode:Dt,onToggleTheme:$r,isDevMode:Ir,connectionStatus:Et,endpoint:f,isVisible:A,toolbarNearBottom:!!Ge&&Ge.y<230,settingsPage:ue,onSettingsPageChange:he,onHideToolbar:Rr})]})}),(Z||Ie)&&e.jsx("div",{className:`${j.blankCanvas} ${ft?j.visible:""} ${Un?j.gridActive:""}`,style:{"--canvas-opacity":Bt},"data-feedback-toolbar":!0}),Z&&we&&ft&&e.jsxs("div",{className:j.wireframeNotice,"data-feedback-toolbar":!0,children:[e.jsxs("div",{className:j.wireframeOpacityRow,children:[e.jsx("span",{className:j.wireframeOpacityLabel,children:"Toggle Opacity"}),e.jsx("input",{type:"range",className:j.wireframeOpacitySlider,min:0,max:1,step:.01,value:Bt,onChange:l=>kt(Number(l.target.value))})]}),e.jsxs("div",{className:j.wireframeNoticeTitleRow,children:[e.jsx("span",{className:j.wireframeNoticeTitle,children:"Wireframe Mode"}),e.jsx("span",{className:j.wireframeNoticeDivider}),e.jsx("button",{className:j.wireframeStartOver,onClick:()=>{wo(l=>l+1),jt({sections:[],originalOrder:[],detectedAt:Date.now()}),Jt.current={rearrange:null,placements:[]},Ft(""),uo(se)},children:"Start Over"})]}),"Drag components onto the canvas.",e.jsx("br",{}),"Copied output will only include the wireframed layout."]}),(Z||Ie)&&e.jsx(Rl,{placements:U,onChange:Oe,activeComponent:Ie?null:ge,onActiveComponentChange:oe,isDarkMode:Dt,exiting:Ie,onInteractionChange:pr,passthrough:!ge,extraSnapRects:de?.sections.map(l=>l.currentRect),deselectSignal:fr,clearSignal:br,wireframe:we,onSelectionChange:(l,d)=>{Sn.current=l,d||(Qn.current=new Set,xr(u=>u+1))},onDragMove:(l,d)=>{const u=Qn.current;if(!(!u.size||!de)){if(!It.current){It.current=new Map;for(const h of de.sections)u.has(h.id)&&It.current.set(h.id,{x:h.currentRect.x,y:h.currentRect.y})}for(const h of de.sections){if(!u.has(h.id)||!It.current.get(h.id))continue;const S=document.querySelector(`[data-rearrange-section="${h.id}"]`);S&&(S.style.transform=`translate(${l}px, ${d}px)`)}}},onDragEnd:(l,d,u)=>{const h=Qn.current,m=It.current;if(It.current=null,!(!h.size||!de||!m)){for(const S of h){const D=document.querySelector(`[data-rearrange-section="${S}"]`);D&&(D.style.transform="")}u&&jt(S=>S&&{...S,sections:S.sections.map(D=>{const W=m.get(D.id);return W?{...D,currentRect:{...D.currentRect,x:Math.max(0,W.x+l),y:Math.max(0,W.y+d)}}:D})})}}}),(Z||Ie)&&de&&e.jsx(Gl,{rearrangeState:de,onChange:jt,isDarkMode:Dt,exiting:Ie,blankCanvas:we,extraSnapRects:U.map(l=>({x:l.x,y:l.y,width:l.width,height:l.height})),clearSignal:wr,deselectSignal:yr,onSelectionChange:(l,d)=>{Qn.current=l,d||(Sn.current=new Set,os(u=>u+1))},onDragMove:(l,d)=>{const u=Sn.current;if(u.size){if(!It.current){It.current=new Map;for(const h of U)u.has(h.id)&&It.current.set(h.id,{x:h.x,y:h.y})}for(const h of u){const m=document.querySelector(`[data-design-placement="${h}"]`);m&&(m.style.transform=`translate(${l}px, ${d}px)`)}}},onDragEnd:(l,d,u)=>{const h=Sn.current,m=It.current;if(It.current=null,!(!h.size||!m)){for(const S of h){const D=document.querySelector(`[data-design-placement="${S}"]`);D&&(D.style.transform="")}u&&Oe(S=>S.map(D=>{const W=m.get(D.id);return W?{...D,x:Math.max(0,W.x+l),y:Math.max(0,W.y+d)}:D}))}}}),e.jsx("canvas",{ref:ko,className:`${E.drawCanvas} ${Lt?E.active:""}`,style:{opacity:$o?1:0,transition:"opacity 0.15s ease"},"data-feedback-toolbar":!0}),e.jsxs("div",{className:E.markersLayer,"data-feedback-toolbar":!0,children:[Me&&xn.filter(l=>!l.isFixed).map((l,d,u)=>e.jsx(Vs,{annotation:l,globalIndex:xn.findIndex(h=>h.id===l.id),layerIndex:d,layerSize:u.length,isExiting:ze,isClearing:Xt,isAnimated:gs.has(l.id),isHovered:!ze&&Ot===l.id,isDeleting:$t===l.id,isEditingAny:!!C,renumberFrom:zt,markerClickBehavior:ke.markerClickBehavior,tooltipStyle:Ms(l),onHoverEnter:h=>!ze&&h.id!==Zn.current&&no(h),onHoverLeave:()=>no(null),onClick:h=>ke.markerClickBehavior==="delete"?Ro(h.id):to(h),onContextMenu:to},l.id)),Me&&!ze&&Ss.filter(l=>!l.isFixed).map(l=>e.jsx(qs,{annotation:l},l.id))]}),e.jsxs("div",{className:E.fixedMarkersLayer,"data-feedback-toolbar":!0,children:[Me&&xn.filter(l=>l.isFixed).map((l,d,u)=>e.jsx(Vs,{annotation:l,globalIndex:xn.findIndex(h=>h.id===l.id),layerIndex:d,layerSize:u.length,isExiting:ze,isClearing:Xt,isAnimated:gs.has(l.id),isHovered:!ze&&Ot===l.id,isDeleting:$t===l.id,isEditingAny:!!C,renumberFrom:zt,markerClickBehavior:ke.markerClickBehavior,tooltipStyle:Ms(l),onHoverEnter:h=>!ze&&h.id!==Zn.current&&no(h),onHoverLeave:()=>no(null),onClick:h=>ke.markerClickBehavior==="delete"?Ro(h.id):to(h),onContextMenu:to},l.id)),Me&&!ze&&Ss.filter(l=>l.isFixed).map(l=>e.jsx(qs,{annotation:l,fixed:!0},l.id))]}),T&&e.jsxs("div",{className:E.overlay,"data-feedback-toolbar":!0,style:P||C?{zIndex:99999}:void 0,children:[xe?.rect&&!P&&!Te&&!Ht&&e.jsx("div",{className:`${E.hoverHighlight} ${E.enter}`,style:{left:xe.rect.left,top:xe.rect.top,width:xe.rect.width,height:xe.rect.height,borderColor:"color-mix(in srgb, var(--agentation-color-accent) 50%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 4%, transparent)"}}),it.filter(l=>document.contains(l.element)).map((l,d)=>{const u=l.element.getBoundingClientRect(),h=it.length>1;return e.jsx("div",{className:h?E.multiSelectOutline:E.singleSelectOutline,style:{position:"fixed",left:u.left,top:u.top,width:u.width,height:u.height,...h?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}},d)}),Ot&&!P&&(()=>{const l=I.find(m=>m.id===Ot);if(!l?.boundingBox)return null;if(l.elementBoundingBoxes?.length)return pt.length>0?pt.filter(m=>document.contains(m)).map((m,S)=>{const D=m.getBoundingClientRect();return e.jsx("div",{className:`${E.multiSelectOutline} ${E.enter}`,style:{left:D.left,top:D.top,width:D.width,height:D.height}},`hover-outline-live-${S}`)}):l.elementBoundingBoxes.map((m,S)=>e.jsx("div",{className:`${E.multiSelectOutline} ${E.enter}`,style:{left:m.x,top:m.y-Ne,width:m.width,height:m.height}},`hover-outline-${S}`));const d=Qt&&document.contains(Qt)?Qt.getBoundingClientRect():null,u=d?{x:d.left,y:d.top,width:d.width,height:d.height}:{x:l.boundingBox.x,y:l.isFixed?l.boundingBox.y:l.boundingBox.y-Ne,width:l.boundingBox.width,height:l.boundingBox.height},h=l.isMultiSelect;return e.jsx("div",{className:`${h?E.multiSelectOutline:E.singleSelectOutline} ${E.enter}`,style:{left:u.x,top:u.y,width:u.width,height:u.height,...h?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}})})(),xe&&!P&&!Te&&!Ht&&e.jsxs("div",{className:`${E.hoverTooltip} ${E.enter}`,style:{left:Math.max(8,Math.min(q.x,window.innerWidth-100)),top:Math.max(q.y-(xe.reactComponents?48:32),8)},children:[xe.reactComponents&&e.jsx("div",{className:E.hoverReactPath,children:xe.reactComponents}),e.jsx("div",{className:E.hoverElementName,children:xe.elementName})]}),P&&e.jsxs(e.Fragment,{children:[P.multiSelectElements?.length?P.multiSelectElements.filter(l=>document.contains(l)).map((l,d)=>{const u=l.getBoundingClientRect();return e.jsx("div",{className:`${E.multiSelectOutline} ${En?E.exit:E.enter}`,style:{left:u.left,top:u.top,width:u.width,height:u.height}},`pending-multi-${d}`)}):P.targetElement&&document.contains(P.targetElement)?(()=>{const l=P.targetElement.getBoundingClientRect();return e.jsx("div",{className:`${E.singleSelectOutline} ${En?E.exit:E.enter}`,style:{left:l.left,top:l.top,width:l.width,height:l.height,borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}})})():P.boundingBox&&e.jsx("div",{className:`${P.isMultiSelect?E.multiSelectOutline:E.singleSelectOutline} ${En?E.exit:E.enter}`,style:{left:P.boundingBox.x,top:P.boundingBox.y-Ne,width:P.boundingBox.width,height:P.boundingBox.height,...P.isMultiSelect?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}}),(()=>{const l=P.x,d=P.isFixed?P.y:P.y-Ne;return e.jsxs(e.Fragment,{children:[e.jsx(Qa,{x:l,y:d,isMultiSelect:P.isMultiSelect,isExiting:En}),e.jsx(po,{ref:bs,element:P.element,selectedText:P.selectedText,computedStyles:P.computedStylesObj,placeholder:P.element==="Area selection"?"What should change in this area?":P.isMultiSelect?"Feedback for this group of elements...":"What should change?",onSubmit:Nr,onCancel:Eo,isExiting:En,lightMode:!Dt,accentColor:P.isMultiSelect?"var(--agentation-color-green)":"var(--agentation-color-accent)",style:{left:Math.max(160,Math.min(window.innerWidth-160,l/100*window.innerWidth)),...d>window.innerHeight-290?{bottom:window.innerHeight-d+20}:{top:d+20}}})]})})()]}),C&&e.jsxs(e.Fragment,{children:[C.elementBoundingBoxes?.length?me.length>0?me.filter(l=>document.contains(l)).map((l,d)=>{const u=l.getBoundingClientRect();return e.jsx("div",{className:`${E.multiSelectOutline} ${E.enter}`,style:{left:u.left,top:u.top,width:u.width,height:u.height}},`edit-multi-live-${d}`)}):C.elementBoundingBoxes.map((l,d)=>e.jsx("div",{className:`${E.multiSelectOutline} ${E.enter}`,style:{left:l.x,top:l.y-Ne,width:l.width,height:l.height}},`edit-multi-${d}`)):(()=>{const l=pe&&document.contains(pe)?pe.getBoundingClientRect():null,d=l?{x:l.left,y:l.top,width:l.width,height:l.height}:C.boundingBox?{x:C.boundingBox.x,y:C.isFixed?C.boundingBox.y:C.boundingBox.y-Ne,width:C.boundingBox.width,height:C.boundingBox.height}:null;return d?e.jsx("div",{className:`${C.isMultiSelect?E.multiSelectOutline:E.singleSelectOutline} ${E.enter}`,style:{left:d.x,top:d.y,width:d.width,height:d.height,...C.isMultiSelect?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}}):null})(),e.jsx(po,{ref:ws,element:C.element,selectedText:C.selectedText,computedStyles:Yl(C.computedStyles),placeholder:"Edit your feedback...",initialValue:C.comment,submitLabel:"Save",onSubmit:Br,onCancel:Tr,onDelete:()=>Ro(C.id),isExiting:Lr,lightMode:!Dt,accentColor:C.isMultiSelect?"var(--agentation-color-green)":"var(--agentation-color-accent)",style:(()=>{const l=C.isFixed?C.y:C.y-Ne;return{left:Math.max(160,Math.min(window.innerWidth-160,C.x/100*window.innerWidth)),...l>window.innerHeight-290?{bottom:window.innerHeight-l+20}:{top:l+20}}})()})]}),Ht&&e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:Rn,className:E.dragSelection}),e.jsx("div",{ref:Nn,className:E.highlightsContainer})]})]})]}),document.body)}export{Rc as Agentation,$c as AnimatedBunny,po as AnnotationPopupCSS,kc as IconChatEllipsis,_c as IconCheck,uc as IconCheckSmall,hc as IconCheckSmallAnimated,jc as IconCheckmark,Sc as IconCheckmarkCircle,Cc as IconCheckmarkLarge,li as IconChevronLeft,Mc as IconChevronRight,dc as IconClose,mc as IconCopyAlt,Kr as IconCopyAnimated,ri as IconEdit,pc as IconEye,fc as IconEyeAlt,Zr as IconEyeAnimated,yc as IconEyeClosed,xc as IconEyeMinus,ei as IconGear,qr as IconHelp,ai as IconLayout,Vr as IconListSparkle,si as IconMoon,wc as IconPause,bc as IconPauseAlt,Jr as IconPausePlayAnimated,vc as IconPlayAlt,Qr as IconPlus,gc as IconSendAnimated,Gr as IconSendArrow,oi as IconSun,ii as IconTrash,ti as IconTrashAlt,er as IconXmark,ni as IconXmarkLarge,Rc as PageFeedbackToolbarCSS,ht as closestCrossingShadow,Wn as getElementClasses,Wl as getElementPath,Pn as getNearbyText,Lc as getShadowHost,yo as getStorageKey,Ec as identifyAnimationElement,jn as identifyElement,Ic as isInShadowDOM,Wo as loadAnnotations,hr as saveAnnotations};
