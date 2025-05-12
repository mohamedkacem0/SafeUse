import phone from '../assets/icons/phoneIcon.svg';
import mail from '../assets/icons/mail.svg';
import gps from '../assets/icons/gps.svg';

export default function Contact() {
  return (
    <div>
      <div className="p-[70px]">
        <h1 className="text-[96px] font-medium">Contact</h1>
      </div>

      <div className="border-t-[1px] border-[#111111] rounded-[10px] bg-[#335A2C]">
        <div>
          <div>
          <p className=" text-[#111111]">
            Berrinche
          </p>
          <p className=" text-[#111111]">
            Reach out to us, we’d love to provide help.
          </p>
          </div>
            
          <div>
            <div>
            <div className="flex flex-row gap-[20px]">
              <img src={phone} alt="phone" />
              <p className="text-[#111111]">+1 234 567 890</p>
            </div>
            <div className="flex flex-row gap-[20px]">
              <img src={mail} alt="mail" />
              <p className="text-[#111111]">SafeUse@gmail.com</p>
            </div>
            <div className="flex flex-row gap-[20px]">
              <img src={gps} alt="gps" />
              <p className="text-[#111111]">Madrid 28065</p>
            </div>
            
          </div>

          <div>

          </div>
        </div>
        <div>

        </div>

      </div>
    </div>
    </div>
  );
};
