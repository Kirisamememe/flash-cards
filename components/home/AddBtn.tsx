import EditWordBtn from "@/components/home/EditBtn";

export default function AddWordBtn({ children }: { children?: React.ReactNode }) {

    return <EditWordBtn wordData={undefined}>{children}</EditWordBtn>
}