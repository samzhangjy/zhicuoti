// This file is auto-generated by @hey-api/openapi-ts

import { type Options as ClientOptions, type TDataShape, type Client, urlSearchParamsBodySerializer, formDataBodySerializer } from '@hey-api/client-next';
import type { AuthRegisterData, AuthRegisterResponse, AuthRegisterError, AuthLoginData, AuthLoginResponse, AuthLoginError, AuthGetMeData, AuthGetMeResponse, ClassCreateClassRouteData, ClassCreateClassRouteResponse, ClassCreateClassRouteError, ClassInviteClassRouteData, ClassInviteClassRouteError, ClassDeleteClassRouteData, ClassDeleteClassRouteError, ClassGetClassRouteData, ClassGetClassRouteResponse, ClassGetClassRouteError, ClassEditClassRouteData, ClassEditClassRouteResponse, ClassEditClassRouteError, ClassJoinClassRouteData, ClassJoinClassRouteResponse, ClassJoinClassRouteError, SubjectGetSubjectsRouteData, SubjectGetSubjectsRouteResponse, SubjectGetSubjectData, SubjectGetSubjectResponse, SubjectGetSubjectError, UserEditTeacherRouteData, UserEditTeacherRouteResponse, UserEditTeacherRouteError, UserEditStudentRouteData, UserEditStudentRouteResponse, UserEditStudentRouteError, ProblemOcrImageRouteData, ProblemOcrImageRouteResponse, ProblemOcrImageRouteError, ProblemCreateProblemRouteData, ProblemCreateProblemRouteResponse, ProblemCreateProblemRouteError, ProblemDeleteProblemRouteData, ProblemDeleteProblemRouteError, ProblemGetProblemRouteData, ProblemGetProblemRouteResponse, ProblemGetProblemRouteError, ProblemEditProblemRouteData, ProblemEditProblemRouteResponse, ProblemEditProblemRouteError, ProblemGetMyProblemsRouteData, ProblemGetMyProblemsRouteResponse, ProblemGetMyProblemsRouteError, ProblemGetProblemSolutionRouteData, ProblemGetProblemSolutionRouteError, StaticServeStaticData, StaticServeStaticError, TagGetTagsRouteData, TagGetTagsRouteResponse, TagGetTagsForUserRouteData, TagGetTagsForUserRouteResponse, TagSearchTagsRouteData, TagSearchTagsRouteResponse, TagSearchTagsRouteError, TagGetTagRouteData, TagGetTagRouteResponse, TagGetTagRouteError, TagGetTagForUserRouteData, TagGetTagForUserRouteResponse, TagGetTagForUserRouteError, AnalyzeGetMyOverviewRouteData, AnalyzeGetMyOverviewRouteResponse, AnalyzeGetMyPerSubjectOverviewRouteData, AnalyzeGetMyPerSubjectOverviewRouteResponse, AnalyzeGetMyPerSubjectOverviewRouteError, AnalyzeGetMyTagAiAnalysisRouteData, AnalyzeGetMyTagAiAnalysisRouteError, AnalyzeGetMySubjectAiAnalysisRouteData, AnalyzeGetMySubjectAiAnalysisRouteError, AnalyzeGetStudentOverviewRouteData, AnalyzeGetStudentOverviewRouteResponse, AnalyzeGetStudentOverviewRouteError, AnalyzeGetStudentPerSubjectOverviewRouteData, AnalyzeGetStudentPerSubjectOverviewRouteResponse, AnalyzeGetStudentPerSubjectOverviewRouteError, AnalyzeGetStudentTagAiAnalysisRouteData, AnalyzeGetStudentTagAiAnalysisRouteError, AnalyzeGetStudentSubjectAiAnalysisRouteData, AnalyzeGetStudentSubjectAiAnalysisRouteError, AnalyzeGetClassOverviewRouteData, AnalyzeGetClassOverviewRouteResponse, AnalyzeGetClassOverviewRouteError, AnalyzeGetPerSubjectOverviewRouteData, AnalyzeGetPerSubjectOverviewRouteResponse, AnalyzeGetPerSubjectOverviewRouteError, AnalyzeGetTeacherSubjectAiAnalysisRouteData, AnalyzeGetTeacherSubjectAiAnalysisRouteError, AnalyzeGetTeacherTagAiAnalysisRouteData, AnalyzeGetTeacherTagAiAnalysisRouteError, AnalyzeGetLatestProblemsRouteData, AnalyzeGetLatestProblemsRouteResponse, AnalyzeGetLatestProblemsRouteError, AnalyzeGetLatestSubjectProblemsRouteData, AnalyzeGetLatestSubjectProblemsRouteResponse, AnalyzeGetLatestSubjectProblemsRouteError, AnalyzeGetTagProblemsRouteData, AnalyzeGetTagProblemsRouteResponse, AnalyzeGetTagProblemsRouteError, UtilitiesListEndpointsData } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
};

/**
 * Register
 * Register a new user.
 */
export const authRegister = <ThrowOnError extends boolean = false>(options: Options<AuthRegisterData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<AuthRegisterResponse, AuthRegisterError, ThrowOnError>({
        url: '/api/v1/auth/register',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Login
 * Login a user.
 */
export const authLogin = <ThrowOnError extends boolean = false>(options: Options<AuthLoginData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<AuthLoginResponse, AuthLoginError, ThrowOnError>({
        ...urlSearchParamsBodySerializer,
        url: '/api/v1/auth/login',
        ...options,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...options?.headers
        }
    });
};

/**
 * Get Me
 * Get current user.
 */
export const authGetMe = <ThrowOnError extends boolean = false>(options?: Options<AuthGetMeData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<AuthGetMeResponse, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/auth/me',
        ...options
    });
};

/**
 * Create Class Route
 * Create a new class.
 */
export const classCreateClassRoute = <ThrowOnError extends boolean = false>(options: Options<ClassCreateClassRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ClassCreateClassRouteResponse, ClassCreateClassRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/class/',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Invite Class Route
 * Generate an invitation code for a class.
 */
export const classInviteClassRoute = <ThrowOnError extends boolean = false>(options: Options<ClassInviteClassRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, ClassInviteClassRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/class/{class_id}/invitation-code',
        ...options
    });
};

/**
 * Delete Class Route
 * Delete a class by ID.
 */
export const classDeleteClassRoute = <ThrowOnError extends boolean = false>(options: Options<ClassDeleteClassRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<unknown, ClassDeleteClassRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/class/{class_id}',
        ...options
    });
};

/**
 * Get Class Route
 * Retrieve a class by ID.
 */
export const classGetClassRoute = <ThrowOnError extends boolean = false>(options: Options<ClassGetClassRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<ClassGetClassRouteResponse, ClassGetClassRouteError, ThrowOnError>({
        url: '/api/v1/class/{class_id}',
        ...options
    });
};

/**
 * Edit Class Route
 * Edit a class by ID.
 */
export const classEditClassRoute = <ThrowOnError extends boolean = false>(options: Options<ClassEditClassRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<ClassEditClassRouteResponse, ClassEditClassRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/class/{class_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Join Class Route
 * Join a class by invitation code.
 */
export const classJoinClassRoute = <ThrowOnError extends boolean = false>(options: Options<ClassJoinClassRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ClassJoinClassRouteResponse, ClassJoinClassRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/class/join',
        ...options
    });
};

/**
 * Get Subjects Route
 * Retrieve subjects.
 */
export const subjectGetSubjectsRoute = <ThrowOnError extends boolean = false>(options?: Options<SubjectGetSubjectsRouteData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<SubjectGetSubjectsRouteResponse, unknown, ThrowOnError>({
        url: '/api/v1/subject/',
        ...options
    });
};

/**
 * Get Subject
 * Retrieve a subject.
 */
export const subjectGetSubject = <ThrowOnError extends boolean = false>(options: Options<SubjectGetSubjectData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<SubjectGetSubjectResponse, SubjectGetSubjectError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/subject/{subject_id}',
        ...options
    });
};

/**
 * Edit Teacher Route
 * Edit the current user.
 */
export const userEditTeacherRoute = <ThrowOnError extends boolean = false>(options: Options<UserEditTeacherRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UserEditTeacherRouteResponse, UserEditTeacherRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/user/teacher',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Edit Student Route
 * Edit the current user.
 */
export const userEditStudentRoute = <ThrowOnError extends boolean = false>(options: Options<UserEditStudentRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UserEditStudentRouteResponse, UserEditStudentRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/user/student',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Ocr Image Route
 * Do OCR on a problem.
 */
export const problemOcrImageRoute = <ThrowOnError extends boolean = false>(options: Options<ProblemOcrImageRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ProblemOcrImageRouteResponse, ProblemOcrImageRouteError, ThrowOnError>({
        ...formDataBodySerializer,
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/problem/ocr',
        ...options,
        headers: {
            'Content-Type': null,
            ...options?.headers
        }
    });
};

/**
 * Create Problem Route
 * Create a new problem.
 */
export const problemCreateProblemRoute = <ThrowOnError extends boolean = false>(options: Options<ProblemCreateProblemRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ProblemCreateProblemRouteResponse, ProblemCreateProblemRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/problem/',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Delete Problem Route
 * Delete a problem.
 */
export const problemDeleteProblemRoute = <ThrowOnError extends boolean = false>(options: Options<ProblemDeleteProblemRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<unknown, ProblemDeleteProblemRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/problem/{problem_id}',
        ...options
    });
};

/**
 * Get Problem Route
 * Get a problem by ID.
 */
export const problemGetProblemRoute = <ThrowOnError extends boolean = false>(options: Options<ProblemGetProblemRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<ProblemGetProblemRouteResponse, ProblemGetProblemRouteError, ThrowOnError>({
        url: '/api/v1/problem/{problem_id}',
        ...options
    });
};

/**
 * Edit Problem Route
 * Edit a problem.
 */
export const problemEditProblemRoute = <ThrowOnError extends boolean = false>(options: Options<ProblemEditProblemRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<ProblemEditProblemRouteResponse, ProblemEditProblemRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/problem/{problem_id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Get My Problems Route
 * Get all problems created by the current user.
 */
export const problemGetMyProblemsRoute = <ThrowOnError extends boolean = false>(options?: Options<ProblemGetMyProblemsRouteData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<ProblemGetMyProblemsRouteResponse, ProblemGetMyProblemsRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/problem/my',
        ...options
    });
};

/**
 * Get Problem Solution Route
 * Get the solution of a problem by AI.
 */
export const problemGetProblemSolutionRoute = <ThrowOnError extends boolean = false>(options: Options<ProblemGetProblemSolutionRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, ProblemGetProblemSolutionRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/problem/{problem_id}/solution',
        ...options
    });
};

/**
 * Serve Static
 * Serve static files.
 */
export const staticServeStatic = <ThrowOnError extends boolean = false>(options: Options<StaticServeStaticData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, StaticServeStaticError, ThrowOnError>({
        url: '/api/v1/static/{filepath}',
        ...options
    });
};

/**
 * Get Tags Route
 * Get all tags.
 */
export const tagGetTagsRoute = <ThrowOnError extends boolean = false>(options?: Options<TagGetTagsRouteData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<TagGetTagsRouteResponse, unknown, ThrowOnError>({
        url: '/api/v1/tag/',
        ...options
    });
};

/**
 * Get Tags For User Route
 * Get all tags.
 */
export const tagGetTagsForUserRoute = <ThrowOnError extends boolean = false>(options?: Options<TagGetTagsForUserRouteData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<TagGetTagsForUserRouteResponse, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/tag/my',
        ...options
    });
};

/**
 * Search Tags Route
 * Search tags by name.
 */
export const tagSearchTagsRoute = <ThrowOnError extends boolean = false>(options: Options<TagSearchTagsRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<TagSearchTagsRouteResponse, TagSearchTagsRouteError, ThrowOnError>({
        url: '/api/v1/tag/search',
        ...options
    });
};

/**
 * Get Tag Route
 * Get a tag by ID.
 */
export const tagGetTagRoute = <ThrowOnError extends boolean = false>(options: Options<TagGetTagRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<TagGetTagRouteResponse, TagGetTagRouteError, ThrowOnError>({
        url: '/api/v1/tag/{tag_id}',
        ...options
    });
};

/**
 * Get Tag For User Route
 * Get a tag by ID.
 */
export const tagGetTagForUserRoute = <ThrowOnError extends boolean = false>(options: Options<TagGetTagForUserRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<TagGetTagForUserRouteResponse, TagGetTagForUserRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/tag/{tag_id}/my',
        ...options
    });
};

/**
 * Get My Overview Route
 * Get a student overview.
 */
export const analyzeGetMyOverviewRoute = <ThrowOnError extends boolean = false>(options?: Options<AnalyzeGetMyOverviewRouteData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<AnalyzeGetMyOverviewRouteResponse, unknown, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/me',
        ...options
    });
};

/**
 * Get My Per Subject Overview Route
 * Get per-subject overview of a student.
 */
export const analyzeGetMyPerSubjectOverviewRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetMyPerSubjectOverviewRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetMyPerSubjectOverviewRouteResponse, AnalyzeGetMyPerSubjectOverviewRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/me/subject/{subject_id}',
        ...options
    });
};

/**
 * Get My Tag Ai Analysis Route
 * Get the tag analysis from AI.
 */
export const analyzeGetMyTagAiAnalysisRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetMyTagAiAnalysisRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, AnalyzeGetMyTagAiAnalysisRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/me/tag/{tag_id}/ai',
        ...options
    });
};

/**
 * Get My Subject Ai Analysis Route
 * Get the subject analysis from AI.
 */
export const analyzeGetMySubjectAiAnalysisRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetMySubjectAiAnalysisRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, AnalyzeGetMySubjectAiAnalysisRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/me/subject/{subject_id}/ai',
        ...options
    });
};

/**
 * Get Student Overview Route
 * Get a student overview.
 */
export const analyzeGetStudentOverviewRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetStudentOverviewRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetStudentOverviewRouteResponse, AnalyzeGetStudentOverviewRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/student/{user_id}',
        ...options
    });
};

/**
 * Get Student Per Subject Overview Route
 * Get per-subject overview of a student.
 */
export const analyzeGetStudentPerSubjectOverviewRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetStudentPerSubjectOverviewRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetStudentPerSubjectOverviewRouteResponse, AnalyzeGetStudentPerSubjectOverviewRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/student/{user_id}/subject/{subject_id}',
        ...options
    });
};

/**
 * Get Student Tag Ai Analysis Route
 * Get the tag analysis from AI.
 */
export const analyzeGetStudentTagAiAnalysisRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetStudentTagAiAnalysisRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, AnalyzeGetStudentTagAiAnalysisRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/student/{user_id}/tag/{tag_id}/ai',
        ...options
    });
};

/**
 * Get Student Subject Ai Analysis Route
 * Get the subject analysis from AI.
 */
export const analyzeGetStudentSubjectAiAnalysisRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetStudentSubjectAiAnalysisRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, AnalyzeGetStudentSubjectAiAnalysisRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/student/{user_id}/subject/{subject_id}/ai',
        ...options
    });
};

/**
 * Get Class Overview Route
 * Get a class overview.
 */
export const analyzeGetClassOverviewRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetClassOverviewRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetClassOverviewRouteResponse, AnalyzeGetClassOverviewRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/{class_id}',
        ...options
    });
};

/**
 * Get Per Subject Overview Route
 * Get per-subject overview of a class.
 */
export const analyzeGetPerSubjectOverviewRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetPerSubjectOverviewRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetPerSubjectOverviewRouteResponse, AnalyzeGetPerSubjectOverviewRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/{class_id}/subject/{subject_id}',
        ...options
    });
};

/**
 * Get Teacher Subject Ai Analysis Route
 * Get the subject analysis from AI.
 */
export const analyzeGetTeacherSubjectAiAnalysisRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetTeacherSubjectAiAnalysisRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, AnalyzeGetTeacherSubjectAiAnalysisRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/{class_id}/subject/{subject_id}/ai',
        ...options
    });
};

/**
 * Get Teacher Tag Ai Analysis Route
 * Get the tag analysis from AI.
 */
export const analyzeGetTeacherTagAiAnalysisRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetTeacherTagAiAnalysisRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<unknown, AnalyzeGetTeacherTagAiAnalysisRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/{class_id}/tag/{tag_id}/ai',
        ...options
    });
};

/**
 * Get Latest Problems Route
 * Get latest problems of a class.
 */
export const analyzeGetLatestProblemsRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetLatestProblemsRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetLatestProblemsRouteResponse, AnalyzeGetLatestProblemsRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/{class_id}/latest',
        ...options
    });
};

/**
 * Get Latest Subject Problems Route
 * Get latest problems of a class.
 */
export const analyzeGetLatestSubjectProblemsRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetLatestSubjectProblemsRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetLatestSubjectProblemsRouteResponse, AnalyzeGetLatestSubjectProblemsRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/{class_id}/subject/{subject_id}/latest',
        ...options
    });
};

/**
 * Get Tag Problems Route
 * Get problems by tag.
 */
export const analyzeGetTagProblemsRoute = <ThrowOnError extends boolean = false>(options: Options<AnalyzeGetTagProblemsRouteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<AnalyzeGetTagProblemsRouteResponse, AnalyzeGetTagProblemsRouteError, ThrowOnError>({
        security: [
            {
                scheme: 'bearer',
                type: 'http'
            }
        ],
        url: '/api/v1/analyze/{class_id}/tag/{tag_id}',
        ...options
    });
};

/**
 * List Endpoints
 * List all available endpoints.
 */
export const utilitiesListEndpoints = <ThrowOnError extends boolean = false>(options?: Options<UtilitiesListEndpointsData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<unknown, unknown, ThrowOnError>({
        url: '/api/v1/utils/endpoints/',
        ...options
    });
};