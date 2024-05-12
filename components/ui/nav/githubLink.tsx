import Link from "next/link";

const GithubLink = () => {
    return (
        <Link href={"https://github.com/Kirisamememe/flash-cards"}
              target={"_blank"}
              className={"group hidden sm:flex justify-center items-center size-10 hover:bg-accent rounded-md"}>
            <svg className={"fill-foreground group-hover:fill-Brand-950"} width="24" height="24" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 2C6.47833 2 2 6.4775 2 12C2 16.4183 4.865 20.1667 8.83917 21.4892C9.33833 21.5817 9.5 21.2717 9.5 21.0083V19.1467C6.71833 19.7517 6.13917 17.9667 6.13917 17.9667C5.68417 16.8108 5.02833 16.5033 5.02833 16.5033C4.12083 15.8825 5.0975 15.8958 5.0975 15.8958C6.10167 15.9658 6.63 16.9267 6.63 16.9267C7.52167 18.455 8.96917 18.0133 9.54 17.7575C9.62917 17.1117 9.88833 16.67 10.175 16.4208C7.95417 16.1667 5.61917 15.3092 5.61917 11.4783C5.61917 10.3858 6.01 9.49417 6.64917 8.79417C6.54583 8.54167 6.20333 7.52417 6.74667 6.1475C6.74667 6.1475 7.58667 5.87917 9.4975 7.1725C10.295 6.95083 11.15 6.84 12 6.83583C12.85 6.84 13.7058 6.95083 14.505 7.1725C16.4142 5.87917 17.2525 6.1475 17.2525 6.1475C17.7967 7.525 17.4542 8.5425 17.3508 8.79417C17.9925 9.49417 18.38 10.3867 18.38 11.4783C18.38 15.3192 16.0408 16.165 13.8142 16.4125C14.1725 16.7225 14.5 17.3308 14.5 18.2642V21.0083C14.5 21.2742 14.66 21.5867 15.1675 21.4883C19.1383 20.1642 22 16.4167 22 12C22 6.4775 17.5225 2 12 2Z"
                />
            </svg>
        </Link>
    )
}

export default GithubLink