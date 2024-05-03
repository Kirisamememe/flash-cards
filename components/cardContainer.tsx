import Card, {WordCard} from "@/components/wordCard";

export default function CardContainer({words}: {words: WordCard[]}) {
    let currentIndex = 0;
    setInterval(() => {
        currentIndex++
    }, 1000)

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Card wordInfo={words[currentIndex]}/>
        </div>
    )
}