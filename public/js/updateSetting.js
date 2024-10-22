import axios from 'axios'

export const updateData = async(form)=>{
    try {
        
        
        const res = await axios.patch('/api/v1/users/update-MyProfile',form)

        if(res.data.status === 'success'){
            alert('Data Updated Succesfully');
            window.setTimeout(()=>{
                location.assign('/me')
            },500);
        }
    } catch (err) {
        console.log(err);
        
    }
}

export const updatePass = async(currPass,newPass)=>{
    try {
        const res = await axios.patch('/api/v1/users/update-password',{
            passwordCurrent: currPass,
            password: newPass,
            passwordConfirm: newPass // Correct field name
        });
        if(res.data.status === 'success'){
            // alert('Data Updated Succesfully');
            window.setTimeout(()=>{
                location.assign('/me')
            },500);
        }
    } catch (err) {
        console.log(err);
        console.log(err.response.data);  // This will show you the actual error message from the server

    }
}