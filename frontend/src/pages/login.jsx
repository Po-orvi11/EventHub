import Form from '../components/Form'
import Navbar from '../components/navbar'

function Login(){
    return (
    <div>
    <Form route='/api/token/' method='login' />
    </div>
    )
}

export default Login;