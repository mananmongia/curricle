# frozen_string_literal: true

def format_as_constant(str)
  str.gsub(%r{[\s\-\/\.]}, '_').gsub(/[^a-zA-Z0-9\_]/, '').upcase
end

def generate_enum_values(attr)
  strs = Course.distinct.pluck(attr).compact.sort
  strs.delete('')

  strs.each { |str| value(format_as_constant(str), str, value: str) }
end

SortByEnum = GraphQL::EnumType.define do
  name 'SortByEnum'

  value('COURSE_ID', 'Course ID', value: %i[subject catalog_number])
  value('DEPARTMENT', 'Department', value: %i[subject])
  value('RELEVANCE', 'Relevance', value: %i[score academic_year term_name])
  value('SCHOOL', 'School', value: %i[academic_group])
  value('SEMESTER', 'Semester', value: %i[academic_year term_name])
  value('TITLE', 'Title', value: %i[title_sortable])
end

SchoolEnum = GraphQL::EnumType.define do
  name 'SchoolEnum'

  generate_enum_values(:academic_group)
end

DepartmentEnum = GraphQL::EnumType.define do
  name 'DepartmentEnum'

  generate_enum_values(:subject_academic_org_description)
end

SubjectEnum = GraphQL::EnumType.define do
  name 'SubjectEnum'

  generate_enum_values(:subject)
end

ComponentEnum = GraphQL::EnumType.define do
  name 'ComponentEnum'

  generate_enum_values(:component)
end

Types::QueryType = GraphQL::ObjectType.define do
  name 'Query'
  description 'Curricle queries'

  # TODO: Remove/deprecate courses field and CoursesResolver in favor of CoursesConnection
  field :courses, types[Types::CourseType] do
    description 'Queries that return lists of courses'

    argument :semester_range, Inputs::SemesterRangeInput, 'Range of semesters to search'
    argument :deluxe_keywords, types[!Inputs::DeluxeKeywordInput], 'List of objects for a weighted, field-specific search'
    argument :time_ranges, types[!Inputs::TimeRangeInput], 'List of times/days to look for courses'
    argument :ids, types[!types.ID], 'List of course IDs'
    argument :per_page, types.Int, 'Number of courses to return'
    argument :page, types.Int, 'Pagination page'
    argument :sort_by, SortByEnum, 'Sort method for search results'
    argument :schools, types[!SchoolEnum], 'Filter results by school'
    argument :departments, types[!DepartmentEnum], 'Filter results by department'
    argument :subjects, types[!SubjectEnum], 'Filter results by subject'
    argument :components, types[!ComponentEnum], 'Filter results by component'
    argument :annotated, types.Boolean, 'Only return courses annotated by current user'

    resolve Resolvers::CoursesResolver.new
  end

  field :count_courses_by_department, !types[Types::CoursesByDepartmentType] do
    description 'Return counts of courses by department'

    argument :academic_group, !types.String, 'Academic group'

    resolve Resolvers::CoursesByDepartmentResolver.new
  end

  field :course_counts, !types[Types::CourseCountType] do
    description 'Return course counts'

    argument :component, ComponentEnum
    argument :department, DepartmentEnum
    argument :semester, Inputs::SemesterInput

    resolve Resolvers::CourseCountsResolver.new
  end

  field :course, Types::CourseType do
    description 'Find a course'

    argument :id, !types.ID, 'Course ID'

    resolve ->(_obj, args, _ctx) { Course.find(args[:id]) }
  end

  field :user_courses, !types[Types::CourseType] do
    description "Return user's selected courses"

    argument :schedule_token, types.String, 'Token for looking up a shared schedule'

    resolve Resolvers::UserCoursesResolver.new
  end

  connection :coursesConnection, Connections::CoursesConnection do
    description 'Queries that return lists of courses with connection metadata'

    argument :annotated, types.Boolean, 'Only return courses annotated by current user'
    argument :basic, types.String, 'Simple search queries using the my.harvard operators'
    argument :components, types[!ComponentEnum], 'Filter results by component'
    argument :deluxe_keywords, types[!Inputs::DeluxeKeywordInput], 'List of objects for a weighted, field-specific search'
    argument :departments, types[!DepartmentEnum], 'Filter results by department'
    argument :ids, types[!types.ID], 'List of course IDs'
    argument :page, types.Int, 'Pagination page'
    argument :per_page, types.Int, 'Number of courses to return'
    argument :schools, types[!SchoolEnum], 'Filter results by school'
    argument :semester_range, Inputs::SemesterRangeInput, 'Range of semesters to search'
    argument :sort_by, SortByEnum, 'Sort method for search results'
    argument :subjects, types[!SubjectEnum], 'Filter results by subject'
    argument :time_ranges, types[!Inputs::TimeRangeInput], 'List of times/days to look for courses'

    resolve Resolvers::CoursesConnectionResolver.new
  end

  field :courses_connected_by_instructor, !types[Types::CourseType] do
    description 'Returns collection of courses taught by instructors connected to a given instructor'

    argument :name, !types.String, "Instructor's name"
    argument :semester, !Inputs::SemesterInput

    resolve Resolvers::CoursesConnectedByInstructorResolver.new
  end
end
