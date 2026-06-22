// Simple custom toast system (hackathon friendly)

let toastContainer = null;

// Create container if not exists
function createContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "fixed bottom-5 right-5 flex flex-col gap-2 z-50";
    document.body.appendChild(toastContainer);
  }
}

// Toast function
export function toast(message, type = "default") {
  createContainer();

  const el = document.createElement("div");

  let bgColor = "bg-cyan-500";
  if (type === "success") bgColor = "bg-green-500";
  if (type === "error") bgColor = "bg-red-500";

  el.className = `${bgColor} text-black px-4 py-2 rounded-lg shadow-lg animate-fade-in`;

  el.innerText = message;

  toastContainer.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 3000);
}

// Toaster component (required for import)
export function Toaster() {
  return null;
}