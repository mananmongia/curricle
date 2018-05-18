# frozen_string_literal: true

module Resolvers
  # Return a collection of courses taught by instructors connected to a given instructor
  class CoursesConnectedByInstructorResolver
    def call(_obj, args, _ctx)
      term_year = Time.current.year

      search =
        CourseInstructor.search do
          fulltext args[:name]
          with :term_year, term_year
        end

      instructor_email = search.results.first.email
      course_ids_taught_by_instructor = search.results.map(&:course_id)

      instructor_emails =
        CourseInstructor
        .where(course_id: course_ids_taught_by_instructor, term_year: term_year)
        .where.not(email: instructor_email)
        .distinct
        .pluck(:email)

      course_ids_taught_by_connected_instructors =
        CourseInstructor
        .where(email: instructor_emails, term_year: term_year)
        .distinct
        .pluck(:course_id)

      Course.where(id: course_ids_taught_by_connected_instructors)
    end
  end
end
