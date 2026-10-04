
function Button({ text }: { text: string }) {
  return (
    <button className="w-fit py-5 px-7 h-full bg-orange-65 cursor-pointer rounded-lg text-[24px] max-xl:text-[20px] max-md:text-[16px]">{text}</button>
  )
}

export default Button
