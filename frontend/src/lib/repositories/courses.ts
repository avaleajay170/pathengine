import { useQuery } from "@tanstack/react-query";
import {
  courses as mockCourses,
  findCourseInPaths,
  getCourse as getMockCourse,
  getReviews as getMockReviews,
  ratingBreakdown,
  type Course,
  type Review,
} from "@/data/mock";
import { api, isApiEnabled } from "@/lib/api-client";
import type { CoursesListResponse, ReviewsResponse } from "@/lib/types/api";

export interface CourseFilters {
  q?: string;
  category?: string;
  level?: string;
  page?: number;
  limit?: number;
}

function filterMockCourses(filters: CourseFilters = {}): CoursesListResponse {
  const query = filters.q?.toLowerCase() ?? "";
  const filtered = mockCourses.filter((course) => {
    const matchesQuery = `${course.title} ${course.provider} ${course.skills.join(" ")}`
      .toLowerCase()
      .includes(query);
    return (
      matchesQuery &&
      (!filters.category || course.category === filters.category) &&
      (!filters.level || course.level === filters.level)
    );
  });
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filtered.length;
  return {
    courses: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    limit,
  };
}

export async function fetchCourses(filters?: CourseFilters): Promise<CoursesListResponse> {
  if (!isApiEnabled) return filterMockCourses(filters);
  const result = await api.get<CoursesListResponse>("/api/v1/courses", {
    params: filters ? { ...filters } : {},
  });
  if (result.ok) return result.data;
  if (result.error.status === 0) return filterMockCourses(filters);
  throw result.error;
}

export async function fetchCourse(id: string): Promise<Course | undefined> {
  if (!isApiEnabled) return getMockCourse(id);
  const result = await api.get<Course>(`/api/v1/courses/${encodeURIComponent(id)}`);
  if (result.ok) return result.data;
  if (result.error.status === 0 || result.error.status === 404) return getMockCourse(id);
  throw result.error;
}

export async function fetchReviews(courseId: string): Promise<ReviewsResponse> {
  const course = getMockCourse(courseId);
  if (!isApiEnabled && course) {
    const reviews = getMockReviews(courseId);
    return {
      reviews,
      averageRating: course.rating,
      totalReviews: course.reviews,
      breakdown: ratingBreakdown(course),
    };
  }
  const result = await api.get<ReviewsResponse>(
    `/api/v1/courses/${encodeURIComponent(courseId)}/reviews`,
  );
  if (result.ok) return result.data;
  if (result.error.status === 0 && course) {
    const reviews: Review[] = getMockReviews(courseId);
    return {
      reviews,
      averageRating: course.rating,
      totalReviews: course.reviews,
      breakdown: ratingBreakdown(course),
    };
  }
  throw result.error;
}

export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: ["courses", filters ?? {}],
    queryFn: () => fetchCourses(filters),
  });
}

export function useCourse(id: string) {
  return useQuery({ queryKey: ["course", id], queryFn: () => fetchCourse(id), enabled: Boolean(id) });
}

export function useCourseReviews(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId, "reviews"],
    queryFn: () => fetchReviews(courseId),
    enabled: Boolean(courseId),
  });
}

export function findCoursePathContext(courseId: string) {
  return findCourseInPaths(courseId);
}