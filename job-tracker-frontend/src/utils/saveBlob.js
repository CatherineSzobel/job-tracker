// Saves an axios blob response (responseType: "blob") as a file, through a temporary <a download>
export function saveBlob(res, filename) {
  const url = window.URL.createObjectURL(new Blob([res.data], { type: res.data.type }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
