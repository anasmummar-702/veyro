// Generated from the Supabase schema (supabase gen types). Regenerate after migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          course_id: string
          course_title: string
          enrollment_id: string
          id: string
          issued_at: string
          recipient_name: string
          serial: string
          user_id: string
        }
        Insert: {
          course_id: string
          course_title: string
          enrollment_id: string
          id?: string
          issued_at?: string
          recipient_name: string
          serial: string
          user_id: string
        }
        Update: {
          course_id?: string
          course_title?: string
          enrollment_id?: string
          id?: string
          issued_at?: string
          recipient_name?: string
          serial?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: { name: string; slug: string; sort_order: number }
        Insert: { name: string; slug: string; sort_order?: number }
        Update: { name?: string; slug?: string; sort_order?: number }
        Relationships: []
      }
      courses: {
        Row: {
          category_slug: string | null
          cover_motif: string
          cover_tone: string
          created_at: string
          description: string
          id: string
          instructor_id: string
          language: string
          level: Database["public"]["Enums"]["course_level"]
          outcomes: string[]
          published_at: string | null
          search: unknown
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_slug?: string | null
          cover_motif?: string
          cover_tone?: string
          created_at?: string
          description?: string
          id?: string
          instructor_id?: string
          language?: string
          level?: Database["public"]["Enums"]["course_level"]
          outcomes?: string[]
          published_at?: string | null
          search?: unknown
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_slug?: string | null
          cover_motif?: string
          cover_tone?: string
          created_at?: string
          description?: string
          id?: string
          instructor_id?: string
          language?: string
          level?: Database["public"]["Enums"]["course_level"]
          outcomes?: string[]
          published_at?: string | null
          search?: unknown
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          last_activity_at: string
          last_lesson_id: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          last_activity_at?: string
          last_lesson_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          last_activity_at?: string
          last_lesson_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_last_lesson_id_fkey"
            columns: ["last_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_contents: {
        Row: {
          attribution: string | null
          body_md: string | null
          lesson_id: string
          updated_at: string
          video_provider: string | null
          video_ref: string | null
        }
        Insert: {
          attribution?: string | null
          body_md?: string | null
          lesson_id: string
          updated_at?: string
          video_provider?: string | null
          video_ref?: string | null
        }
        Update: {
          attribution?: string | null
          body_md?: string | null
          lesson_id?: string
          updated_at?: string
          video_provider?: string | null
          video_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_contents_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          enrollment_id: string
          id: string
          is_completed: boolean
          last_position_sec: number
          last_reported_at: string | null
          lesson_id: string
          rejected_reports: number
          updated_at: string
          user_id: string
          watched_intervals: Json
          watched_sec: number
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          enrollment_id: string
          id?: string
          is_completed?: boolean
          last_position_sec?: number
          last_reported_at?: string | null
          lesson_id: string
          rejected_reports?: number
          updated_at?: string
          user_id: string
          watched_intervals?: Json
          watched_sec?: number
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          is_completed?: boolean
          last_position_sec?: number
          last_reported_at?: string | null
          lesson_id?: string
          rejected_reports?: number
          updated_at?: string
          user_id?: string
          watched_intervals?: Json
          watched_sec?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          course_id: string
          created_at: string
          duration_sec: number
          has_video: boolean
          id: string
          is_preview: boolean
          is_required: boolean
          module_id: string
          position: number
          title: string
          type: Database["public"]["Enums"]["lesson_type"]
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_sec?: number
          has_video?: boolean
          id?: string
          is_preview?: boolean
          is_required?: boolean
          module_id: string
          position: number
          title: string
          type: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_sec?: number
          has_video?: boolean
          id?: string
          is_preview?: boolean
          is_required?: boolean
          module_id?: string
          position?: number
          title?: string
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_course_id_fkey"
            columns: ["module_id", "course_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id", "course_id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          headline: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          headline?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          headline?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_move_lesson: {
        Args: { p_direction: number; p_lesson_id: string }
        Returns: undefined
      }
      admin_move_module: {
        Args: { p_direction: number; p_module_id: string }
        Returns: undefined
      }
      admin_overview: { Args: never; Returns: Json }
      admin_students: {
        Args: never
        Returns: {
          certificates: number
          courses: Json
          email: string
          full_name: string
          id: string
          joined_at: string
          last_activity_at: string | null
          last_sign_in_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }[]
      }
      claim_my_certificates: {
        Args: never
        Returns: {
          course_id: string
          course_title: string
          enrollment_id: string
          id: string
          issued_at: string
          recipient_name: string
          serial: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "certificates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      complete_article_lesson: { Args: { p_lesson_id: string }; Returns: Json }
      enroll_in_course: {
        Args: { p_course_id: string }
        Returns: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          last_activity_at: string
          last_lesson_id: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "enrollments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      open_lesson: { Args: { p_lesson_id: string }; Returns: undefined }
      set_lesson_video: {
        Args: { p_lesson_id: string; p_video_ref: string }
        Returns: undefined
      }
      verify_certificate: {
        Args: { p_serial: string }
        Returns: {
          course_slug: string
          course_title: string
          issued_at: string
          recipient_name: string
          serial: string
        }[]
      }
      record_video_progress: {
        Args: {
          p_intervals: Json
          p_lesson_id: string
          p_player_duration?: number
          p_position: number
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "student" | "instructor" | "admin"
      course_level: "beginner" | "intermediate" | "advanced"
      course_status: "draft" | "published" | "archived"
      enrollment_status: "active" | "completed" | "cancelled"
      lesson_type: "video" | "article" | "quiz"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]
