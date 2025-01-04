export const copyToClipboard = ()=>{
    let item = document.getElementById('joining-code');
    if (item) {
        (item as HTMLInputElement).select();
    }
    document.execCommand("copy")
}