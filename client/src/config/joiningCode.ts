export const generateJoiningCode = ()=>{
    const code = Math.random().toString(36).substring(7)
    console.log("code for joining team",code)
    return code;
}