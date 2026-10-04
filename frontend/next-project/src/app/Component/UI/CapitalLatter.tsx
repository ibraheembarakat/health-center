
function CapitalLatter({ text }: { text: string }) {
  const capitalizedText = text
    ?.split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div>
      {capitalizedText}
    </div>
  );
}

export default CapitalLatter
