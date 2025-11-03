import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";
import Loading from "@/components/Loading";

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPageContent />
    </Suspense>
  );
}