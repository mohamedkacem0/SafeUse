import phone from '../assets/icons/phoneIcon.svg';
import mail from '../assets/icons/mail.svg';
import gps from '../assets/icons/gps.svg';
import twitter from '../assets/icons/twitter.svg';
import instagram from '../assets/icons/instagram.svg';
import discord from '../assets/icons/discord.svg';
import ContactForm from '../components/ContactForm';

export default function Contact() {
  return (
    <div className='mx-auto mb-[100px]'>
        <div className="p-[70px]">
          <h1 className="text-[96px] font-medium">Contact</h1>
        </div>
      
      <div className='flex flex-row justify-between mx-[120px]'>
        <div className="border-t-[1px] border-[#111111] rounded-[10px] bg-[#335A2C]">
          <div className="flex flex-col gap-[120px] justify-start p-[40px] text-white">
            <div>
              <p className="text-[36px]">Write us</p>
              <p className="">Reach out to us, we’d love to provide help.</p>
            </div>

            <div className="flex flex-col gap-[40px]">
              <div className="flex flex-row gap-[20px]">
                <img src={phone} alt="phone" />
                <p className="">+1 234 567 890</p>
              </div>
              <div className="flex flex-row gap-[20px]">
                <img src={mail} alt="mail" />
                <p className="">SafeUse@gmail.com</p>
              </div>
              <div className="flex flex-row gap-[20px]">
                <img src={gps} alt="gps" />
                <p className="">Madrid 28065</p>
              </div>
            </div>

            <div className="flex flex-row gap-[24px]">
              <img src={twitter} alt="twitter" />
              <img src={instagram} alt="instagram" />
              <img src={discord} alt="discord" />
            </div>
          </div>
        </div>

        <div className="border-y-[1px] border-[#111111] w-[60%]">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
