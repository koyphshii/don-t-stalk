import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBoxWithDetails, getBoxQuestions, getVotingProgress, getQuestionsForVoting, getResultsForBox } from "@/lib/data";
import { getCurrentVotesForOwner } from "@/app/actions/vote-actions";
import { CollectingView } from "@/components/boxes/collecting-view";
import { VotingView } from "@/components/boxes/voting-view";
import { ClosedView } from "@/components/boxes/closed-view";
import { RevealedView } from "@/components/boxes/revealed-view";
import { BoxHeader } from "@/components/boxes/box-header";

interface BoxPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoxPage({ params }: BoxPageProps) {
  const { id } = await params;
  const box = await getBoxWithDetails(id);

  if (!box) {
    notFound();
  }

  if (!box.isMember) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-2xl font-display font-bold mb-2">
          You&apos;re not a member
        </h2>
        <p className="text-muted-foreground">
          You need an invite link to join this box.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <BoxHeader box={box} />

      {box.status === "COLLECTING" && (
        <Suspense fallback={<div className="h-48 bg-muted/20 rounded animate-pulse" />}>
          <CollectingViewWrapper boxId={id} isOwner={box.isOwner} />
        </Suspense>
      )}

      {box.status === "VOTING" && (
        <Suspense fallback={<div className="h-48 bg-muted/20 rounded animate-pulse" />}>
          <VotingViewWrapper boxId={id} isOwner={box.isOwner} />
        </Suspense>
      )}

      {box.status === "CLOSED" && (
        <Suspense fallback={<div className="h-48 bg-muted/20 rounded animate-pulse" />}>
          <ClosedViewWrapper boxId={id} isOwner={box.isOwner} />
        </Suspense>
      )}

      {box.status === "REVEALED" && (
        <Suspense fallback={<div className="h-48 bg-muted/20 rounded animate-pulse" />}>
          <RevealedViewWrapper boxId={id} />
        </Suspense>
      )}
    </div>
  );
}

async function CollectingViewWrapper({
  boxId,
  isOwner,
}: {
  boxId: string;
  isOwner: boolean;
}) {
  const questions = await getBoxQuestions(boxId);
  return (
    <CollectingView
      boxId={boxId}
      questions={questions}
      isOwner={isOwner}
    />
  );
}

async function VotingViewWrapper({
  boxId,
  isOwner,
}: {
  boxId: string;
  isOwner: boolean;
}) {
  const [votingData, progress, liveVotes] = await Promise.all([
    getQuestionsForVoting(boxId),
    getVotingProgress(boxId),
    isOwner ? getCurrentVotesForOwner(boxId) : Promise.resolve(null),
  ]);

  if (!votingData || !progress) {
    return <div className="text-center py-8 text-muted-foreground">Loading voting data...</div>;
  }

  return (
    <VotingView
      boxId={boxId}
      questions={votingData.questions}
      candidates={votingData.candidates}
      currentUserId={votingData.currentUserId}
      progress={progress}
      isOwner={isOwner}
      liveVotes={liveVotes}
    />
  );
}

async function ClosedViewWrapper({
  boxId,
  isOwner,
}: {
  boxId: string;
  isOwner: boolean;
}) {
  const results = isOwner ? await getResultsForBox(boxId) : null;
  return <ClosedView boxId={boxId} isOwner={isOwner} results={results} />;
}

async function RevealedViewWrapper({ boxId }: { boxId: string }) {
  const results = await getResultsForBox(boxId);
  if (!results) {
    return <div className="text-center py-8 text-muted-foreground">Loading results...</div>;
  }
  return <RevealedView results={results} />;
}
