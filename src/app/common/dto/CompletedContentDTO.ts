export interface CompletedContentMinDTO {
  courseId: number;
  sectionId: number;
  contentId: number;
  userId: number;
}

export interface CompletedContentResponseDTO {
  completePercentage: number;
  completedContents: CompletedContentMinDTO[];
}

