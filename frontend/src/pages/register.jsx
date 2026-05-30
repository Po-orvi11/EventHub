import Form from '../components/Form'
import Navbar from '../components/navbar'

function Register(){
    return (
    <div>
    <Form route='/api/user/register/' method='register' />
    </div>
    )
}

export default Register;