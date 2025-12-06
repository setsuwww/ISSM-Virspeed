export async function loadLogoBase64() {
  const res = await fetch("/logo.png");
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const cleanBase64 = reader.result.replace(/^data:image\/\w+;base64,/, "");
      resolve(cleanBase64);
    };
    reader.readAsDataURL(blob);
  });
}
