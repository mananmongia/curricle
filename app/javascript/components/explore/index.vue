<template>
  <div>
    <visualization-card
      title="Learning Styles"
      text="Explore courses by selecting class learning styles and departments."
      link="/explore/classes"
      image="/images/explore/departments.png"
    />

    <visualization-card
      title="Instructor Networks"
      text="Select an instructor to discover faculty networks by course and department."
      link="/explore/instructor"
      image="/images/explore/instructors.png"
    />

    <visualization-card
      title="Course Universe"
      text="Explore all of Harvard's departments and programs to browse their offerings."
      link="/explore/universe"
      image="/images/explore/universe.png"
    />

    <visualization-card
      title="Keyword Comparisons"
      text="Visualize descriptive terms across the curriculum through keyword comparisons."
      link="/explore/keywords"
      image="/images/explore/keywords.png"
    />
  </div>
</template>

<script>
import VisualizationCard from './VisualizationCard'

export default {
  components: {
    VisualizationCard
  }
}
</script>
