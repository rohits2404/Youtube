import { CategoriesSection } from "../sections/category-section";
import { ResultSection } from "../sections/result-section";

interface Props {
    query: string | undefined;
    categoryId: string | undefined;
}

export const SearchView = ({ query, categoryId }: Props) => {
    return (
        <div className="max-w-325 mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
            <CategoriesSection categoryId={categoryId} />
            <ResultSection query={query} categoryId={categoryId} />
        </div>
    )
}