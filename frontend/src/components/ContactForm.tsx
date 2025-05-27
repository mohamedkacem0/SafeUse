
import Button from './PrimaryButton'; 

export default function ContactForm() {
  return (
    <div className="p-[40px] text-[#111111] bg-white w-full">
      <form className="flex flex-col gap-[20px]">
        {/* First Name */}
        <div className='flex flex-row justify-between gap-[40px]'>
        <div className='w-full'>
          <label htmlFor="firstName" className="block text-[18px] font-medium mb-[5px]">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="w-full p-[10px] text-[#111111] border-b-[#111111] border-b-[1px]"
            placeholder="Enter your first name"
          />
        </div>

        {/* Last Name */}
        <div className='w-full'>
          <label htmlFor="lastName" className="block text-[18px] font-medium mb-[5px]">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="w-full p-[10px] text-[#111111] border-b-[#111111] border-b-[1px]"
            placeholder="Enter your last name"
          />
        </div>
        </div>

        {/* Email */}
        <div className='flex flex-row justify-between gap-[40px]'>
        <div className='w-full'>
          <label htmlFor="email" className="block text-[18px] font-medium mb-[5px]">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-[10px] border-b-[#111111] border-b-[1px] text-[#111111]"
            placeholder="Enter your email"
          />
        </div>

        {/* Phone Number */}
        <div className='w-full'>
          <label htmlFor="phone" className="block text-[18px] font-medium mb-[5px]">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full p-[10px] border-b-[#111111] border-b-[1px] text-[#111111]"
            placeholder="Enter your phone number"
          />
        </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-[18px] font-medium mb-[5px]">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full p-[10px] rounded-[5px] text-[#111111]"
            placeholder="Write your message here"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
            <Button text="Send" className='bg-[#335A2C]'/>
        </div>
      </form>
    </div>
  );
}