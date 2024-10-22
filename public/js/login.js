
import axios from 'axios'
import "@babel/polyfill";
 
export const login = async (email,password)=>{
    try {
        const res = await axios.post('/api/v1/users/login',{
            email:email,
            password:password
        })
        
        if(res.data.status === 'success'){
            // showAlert('success', 'Logged in successfully!');
            alert('logged in successfully');
            window.setTimeout(()=>{
                location.assign('/')
            },500);
        }
        // console.log(res);
        
        
    } catch (err) {
        console.error('Error during login:', err.response ? err.response.data : err.message);
    }
}

export const logout = async()=>{
    try {
        const res = await axios.get('/api/v1/users/logout')
        if(res.data.status === 'success')   location.assign('/');
    } catch (err) {
        alert('problem in logging out');
        console.log(err.response);
 
    }
}

