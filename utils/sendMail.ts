import ejs from "ejs"
import nodemailer,{Transporter} from "nodemailer"
import path from "path"

interface EmailOptions {
    email: string;
    subject:string;
    template:string;
    data:{[key:string]:any}
}

const sendEmail = async (options:EmailOptions)=>{

    const transporter : Transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:Number(process.env.EMAIL_PORT),
        secure:false,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    const {email,subject,template,data} = options;

    const templatePath = path.join(__dirname,"../mails/",template)
    const html:string = await ejs.renderFile(templatePath,data)
    const mailOption ={
        from:"LMS Elearning",
        to:email,
        subject:subject,
        html
    }
    await transporter.sendMail(mailOption)
}
export default sendEmail