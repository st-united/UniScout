{
  availableFields.map((field: string) => (
    <option key={field} value={field}>
      {field === 'Medicine'
        ? 'Medicine, Pharmacy & Health Sciences'
        : field === 'Engineering'
        ? 'Science & Engineering'
        : field === 'Business'
        ? 'Economics, Business & Management'
        : field === 'Arts'
        ? 'Arts & Design'
        : field === 'Law'
        ? 'Law & Political Science'
        : field === 'Agricultural Science'
        ? 'Agriculture & Food Science'
        : field === 'Sports'
        ? 'Sports & Physical Education'
        : field === 'Computer Science'
        ? 'Emerging Technologies & Interdisciplinary Studies'
        : field}
    </option>
  ));
}
