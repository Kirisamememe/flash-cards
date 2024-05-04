import CardContainer from "@/components/cardContainer";
import {useTranslations} from 'next-intl';

export default function Index() {
    const t = useTranslations('Index');
    const t2 = useTranslations('WordSubmitForm');
    const t3 = useTranslations("IndexDB")
    const ti = {
        index: {
            create: t('createBtn'),
            edit: t('editBtn'),
            cancel: t('cancel'),
            description: t('description')
        },
        submitForm: {
            submit: t2('submit'),
            word: t2('word'),
            phonetics: t2('phonetics'),
            definition: t2('definition'),
            example: t2('example'),
            notes: t2('notes'),
            word_placeholder: t2('word_placeholder'),
            phonetics_placeholder: t2('phonetics_placeholder'),
            definition_placeholder: t2('definition_placeholder'),
            example_placeholder: t2('example_placeholder'),
            notes_placeholder: t2('notes_placeholder')
        },
        db: {
            saved: t3('saved'),
            deleteCard: t3('deleteCard')
        }
    }

    return (
        <CardContainer ti={ti}/>
    )
}
