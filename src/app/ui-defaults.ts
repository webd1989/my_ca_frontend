/*
 * Global UI rules for the whole ERP
 * SweetAlert2 dialogs (error / success / delete confirm) close only with their own buttons:
 * clicking outside or pressing Esc does not close them.
 * (Bootstrap modals get the same rule in assets/js/erp-ui.js)
 */
import Swal from 'sweetalert2';

const originalFire = (Swal as any).fire.bind(Swal);

(Swal as any).fire = function (...args: any[]) {
  let opts: any;
  if (args.length && args[0] !== null && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    opts = Object.assign({}, args[0]);
  } else {
    // shorthand Swal.fire(title, text, icon)
    const [title, text, icon] = args;
    opts = { title, text, icon };
  }
  if (opts.allowOutsideClick === undefined) { opts.allowOutsideClick = false; }
  if (opts.allowEscapeKey === undefined) { opts.allowEscapeKey = false; }
  return originalFire(opts);
};

export {};
