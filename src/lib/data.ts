import { cache } from "react";
import {
  getBoxWithDetails as getBoxWithDetailsRaw,
  getUserBoxes as getUserBoxesRaw,
} from "@/app/actions/box-actions";
import {
  getBoxQuestions as getBoxQuestionsRaw,
} from "@/app/actions/question-actions";
import {
  getVotingProgress as getVotingProgressRaw,
  getQuestionsForVoting as getQuestionsForVotingRaw,
} from "@/app/actions/vote-actions";
import {
  getResultsForBox as getResultsForBoxRaw,
} from "@/lib/results";

export const getBoxWithDetails = cache(getBoxWithDetailsRaw);
export const getUserBoxes = cache(getUserBoxesRaw);
export const getBoxQuestions = cache(getBoxQuestionsRaw);
export const getVotingProgress = cache(getVotingProgressRaw);
export const getQuestionsForVoting = cache(getQuestionsForVotingRaw);
export const getResultsForBox = cache(getResultsForBoxRaw);
