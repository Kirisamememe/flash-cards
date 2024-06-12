import { EN2ENItem } from "@/types/WordIndexDB";
import { Badge } from "@/components/ui/badge";

const toTitleCase = (str: string) => {
    return str
        .replace(/([A-Z])/g, ' $1') // キャメルケースに対応: "exampleKey" -> "Example Key"
        .replace(/_/g, ' ')  // スネークケースに対応: "example_key" -> "example key"
        .replace(/\b\w/g, (char) => char.toUpperCase())  // 各単語の最初の文字を大文字にする
        .trim()
}

export default function OnlineDic({ en2enItem }: { en2enItem: EN2ENItem }) {
    return (
        <div className={"p-2 font-serif tracking-wide"}>
            <p className={"text-xs text-muted-foreground/50 mb-3"}>
                {"Data from WordsAPI"}
            </p>
            <div className={"flex mb-1"}>
                {en2enItem?.syllables?.list.map((syllable, index, array) => (
                    <span className={"text-2xl lg:text-3xl font-bold"} key={index + syllable}>
                        {index === array.length - 1 ? syllable : `${syllable}･`}
                    </span>
                ))}
            </div>
            {en2enItem?.pronunciation?.all &&
                <p className={"text-sm text-muted-foreground "}>{`/${en2enItem.pronunciation.all}/`}</p>
            }
            <div className={"flex flex-col gap-6 divide-y divide-border"}>
                {en2enItem.results &&
                    en2enItem.results.map((result, index) => (
                        <div key={en2enItem.word + index} className={"flex flex-col gap-2 pt-6"}>
                            <div className={"flex gap-1 font-sans tracking-normal"}>
                                <Badge className={"rounded-sm w-4 justify-center"}>{index + 1}</Badge>
                                {result.partOfSpeech && <Badge className={"rounded-sm px-2"} variant={"coloredSecondary"}>
                                    {result.partOfSpeech}
                                </Badge>}
                            </div>
                            {result.definition &&
                                <p className={"text-lg font-medium"}>
                                    {result.definition}
                                </p>}
                            {result.examples &&
                                <ul className={"ml-3.5 list-disc text-orange-800/70 dark:text-orange-200/70"}>
                                    {result.examples.map((example, index) => (
                                        <li className={""} key={index + example}>
                                            {example}
                                        </li>
                                    ))}
                                </ul>}
                            <div className={"flex flex-col gap-4 mt-3"}>
                                {Object.entries(result).map(([key, value]) => (
                                    key !== "definition" && key !== "partOfSpeech" && key !== "examples" &&
                                    <div key={key}>
                                        <h2 className={"text-sm text-muted-foreground font-bold"}>
                                            {toTitleCase(key)}
                                        </h2>
                                        <p>{String(value).replace(/,/g, ', ')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                }
                {en2enItem?.frequency &&
                    <div className={"pt-4"}>
                        <h3 className={"font-bold text-sm text-muted-foreground"}>{("Frequency")}</h3>
                        <span>{en2enItem.frequency}</span>
                    </div>
                }
            </div>
        </div>
    )
}