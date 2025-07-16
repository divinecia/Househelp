enum EnrollmentStatus { active, completed, cancelled, expired }

enum SubmissionStatus { pending, reviewed, approved, rejected }

enum ContentType {
  video,
  text,
  image,
  audio,
  document,
  quiz,
  assignment,
  interactive,
}

class TrainingCourse {
  final String id;
  final String title;
  final String description;
  final String category;
  final String level; // beginner, intermediate, advanced
  final String instructorId;
  final String? thumbnailUrl;
  final int duration; // in minutes
  final bool isFree;
  final double? price;
  final bool hasCertificate;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isActive;
  final double rating;
  final int ratingCount;
  final int enrollmentCount;
  final String? prerequisites;
  final List<String> learningObjectives;
  final String? language;
  final Map<String, dynamic>? metadata;

  TrainingCourse({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.level,
    required this.instructorId,
    this.thumbnailUrl,
    required this.duration,
    required this.isFree,
    this.price,
    required this.hasCertificate,
    required this.tags,
    required this.createdAt,
    this.updatedAt,
    required this.isActive,
    required this.rating,
    required this.ratingCount,
    required this.enrollmentCount,
    this.prerequisites,
    this.learningObjectives = const [],
    this.language,
    this.metadata,
  });

  factory TrainingCourse.fromJson(Map<String, dynamic> json) {
    return TrainingCourse(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      level: json['level'],
      instructorId: json['instructor_id'],
      thumbnailUrl: json['thumbnail_url'],
      duration: json['duration'] ?? 0,
      isFree: json['is_free'] ?? false,
      price: json['price']?.toDouble(),
      hasCertificate: json['has_certificate'] ?? false,
      tags: List<String>.from(json['tags'] ?? []),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      isActive: json['is_active'] ?? true,
      rating: json['rating']?.toDouble() ?? 0.0,
      ratingCount: json['rating_count'] ?? 0,
      enrollmentCount: json['enrollment_count'] ?? 0,
      prerequisites: json['prerequisites'],
      learningObjectives: List<String>.from(json['learning_objectives'] ?? []),
      language: json['language'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'level': level,
      'instructor_id': instructorId,
      'thumbnail_url': thumbnailUrl,
      'duration': duration,
      'is_free': isFree,
      'price': price,
      'has_certificate': hasCertificate,
      'tags': tags,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_active': isActive,
      'rating': rating,
      'rating_count': ratingCount,
      'enrollment_count': enrollmentCount,
      'prerequisites': prerequisites,
      'learning_objectives': learningObjectives,
      'language': language,
      'metadata': metadata,
    };
  }
}

class CourseModule {
  final String id;
  final String courseId;
  final String title;
  final String description;
  final int orderIndex;
  final int duration; // in minutes
  final bool isPreview;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isActive;

  CourseModule({
    required this.id,
    required this.courseId,
    required this.title,
    required this.description,
    required this.orderIndex,
    required this.duration,
    this.isPreview = false,
    required this.createdAt,
    this.updatedAt,
    this.isActive = true,
  });

  factory CourseModule.fromJson(Map<String, dynamic> json) {
    return CourseModule(
      id: json['id'],
      courseId: json['course_id'],
      title: json['title'],
      description: json['description'],
      orderIndex: json['order_index'] ?? 0,
      duration: json['duration'] ?? 0,
      isPreview: json['is_preview'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'course_id': courseId,
      'title': title,
      'description': description,
      'order_index': orderIndex,
      'duration': duration,
      'is_preview': isPreview,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_active': isActive,
    };
  }
}

class ModuleContent {
  final String id;
  final String moduleId;
  final String title;
  final String description;
  final ContentType type;
  final String? content;
  final String? contentUrl;
  final int orderIndex;
  final int duration; // in minutes
  final bool isRequired;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isActive;
  final Map<String, dynamic>? metadata;

  ModuleContent({
    required this.id,
    required this.moduleId,
    required this.title,
    required this.description,
    required this.type,
    this.content,
    this.contentUrl,
    required this.orderIndex,
    required this.duration,
    this.isRequired = true,
    required this.createdAt,
    this.updatedAt,
    this.isActive = true,
    this.metadata,
  });

  factory ModuleContent.fromJson(Map<String, dynamic> json) {
    return ModuleContent(
      id: json['id'],
      moduleId: json['module_id'],
      title: json['title'],
      description: json['description'],
      type: ContentType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => ContentType.text,
      ),
      content: json['content'],
      contentUrl: json['content_url'],
      orderIndex: json['order_index'] ?? 0,
      duration: json['duration'] ?? 0,
      isRequired: json['is_required'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      isActive: json['is_active'] ?? true,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'module_id': moduleId,
      'title': title,
      'description': description,
      'type': type.name,
      'content': content,
      'content_url': contentUrl,
      'order_index': orderIndex,
      'duration': duration,
      'is_required': isRequired,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_active': isActive,
      'metadata': metadata,
    };
  }
}

class Enrollment {
  final String id;
  final String userId;
  final String courseId;
  final DateTime enrolledAt;
  final DateTime? completedAt;
  final EnrollmentStatus status;
  final double progress; // 0-100
  final double? paymentAmount;
  final String? paymentMethod;
  final DateTime? lastAccessedAt;
  final DateTime? updatedAt;
  final Map<String, dynamic>? metadata;

  Enrollment({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.enrolledAt,
    this.completedAt,
    required this.status,
    required this.progress,
    this.paymentAmount,
    this.paymentMethod,
    this.lastAccessedAt,
    this.updatedAt,
    this.metadata,
  });

  factory Enrollment.fromJson(Map<String, dynamic> json) {
    return Enrollment(
      id: json['id'],
      userId: json['user_id'],
      courseId: json['course_id'],
      enrolledAt: DateTime.parse(json['enrolled_at']),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'])
          : null,
      status: EnrollmentStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => EnrollmentStatus.active,
      ),
      progress: json['progress']?.toDouble() ?? 0.0,
      paymentAmount: json['payment_amount']?.toDouble(),
      paymentMethod: json['payment_method'],
      lastAccessedAt: json['last_accessed_at'] != null
          ? DateTime.parse(json['last_accessed_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'course_id': courseId,
      'enrolled_at': enrolledAt.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'status': status.name,
      'progress': progress,
      'payment_amount': paymentAmount,
      'payment_method': paymentMethod,
      'last_accessed_at': lastAccessedAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'metadata': metadata,
    };
  }
}

class CourseProgress {
  final String id;
  final String userId;
  final String courseId;
  final String moduleId;
  final String contentId;
  final double timeSpent; // in minutes
  final DateTime completedAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? metadata;

  CourseProgress({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.moduleId,
    required this.contentId,
    required this.timeSpent,
    required this.completedAt,
    required this.updatedAt,
    this.metadata,
  });

  factory CourseProgress.fromJson(Map<String, dynamic> json) {
    return CourseProgress(
      id: json['id'],
      userId: json['user_id'],
      courseId: json['course_id'],
      moduleId: json['module_id'],
      contentId: json['content_id'],
      timeSpent: json['time_spent']?.toDouble() ?? 0.0,
      completedAt: DateTime.parse(json['completed_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'course_id': courseId,
      'module_id': moduleId,
      'content_id': contentId,
      'time_spent': timeSpent,
      'completed_at': completedAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

class Certificate {
  final String id;
  final String userId;
  final String courseId;
  final DateTime issuedAt;
  final String certificateNumber;
  final bool isValid;
  final DateTime? expiresAt;
  final String? verificationUrl;
  final Map<String, dynamic>? metadata;

  Certificate({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.issuedAt,
    required this.certificateNumber,
    required this.isValid,
    this.expiresAt,
    this.verificationUrl,
    this.metadata,
  });

  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'],
      userId: json['user_id'],
      courseId: json['course_id'],
      issuedAt: DateTime.parse(json['issued_at']),
      certificateNumber: json['certificate_number'],
      isValid: json['is_valid'] ?? true,
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      verificationUrl: json['verification_url'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'course_id': courseId,
      'issued_at': issuedAt.toIso8601String(),
      'certificate_number': certificateNumber,
      'is_valid': isValid,
      'expires_at': expiresAt?.toIso8601String(),
      'verification_url': verificationUrl,
      'metadata': metadata,
    };
  }
}

class AssignmentSubmission {
  final String id;
  final String userId;
  final String assignmentId;
  final String content;
  final List<String> attachments;
  final DateTime submittedAt;
  final DateTime? reviewedAt;
  final SubmissionStatus status;
  final double? score;
  final String? feedback;
  final String? reviewedBy;
  final Map<String, dynamic>? metadata;

  AssignmentSubmission({
    required this.id,
    required this.userId,
    required this.assignmentId,
    required this.content,
    required this.attachments,
    required this.submittedAt,
    this.reviewedAt,
    required this.status,
    this.score,
    this.feedback,
    this.reviewedBy,
    this.metadata,
  });

  factory AssignmentSubmission.fromJson(Map<String, dynamic> json) {
    return AssignmentSubmission(
      id: json['id'],
      userId: json['user_id'],
      assignmentId: json['assignment_id'],
      content: json['content'],
      attachments: List<String>.from(json['attachments'] ?? []),
      submittedAt: DateTime.parse(json['submitted_at']),
      reviewedAt: json['reviewed_at'] != null
          ? DateTime.parse(json['reviewed_at'])
          : null,
      status: SubmissionStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => SubmissionStatus.pending,
      ),
      score: json['score']?.toDouble(),
      feedback: json['feedback'],
      reviewedBy: json['reviewed_by'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'assignment_id': assignmentId,
      'content': content,
      'attachments': attachments,
      'submitted_at': submittedAt.toIso8601String(),
      'reviewed_at': reviewedAt?.toIso8601String(),
      'status': status.name,
      'score': score,
      'feedback': feedback,
      'reviewed_by': reviewedBy,
      'metadata': metadata,
    };
  }
}

class QuizAttempt {
  final String id;
  final String userId;
  final String quizId;
  final Map<String, dynamic> answers;
  final double score;
  final DateTime completedAt;
  final bool isPassed;
  final int timeSpent; // in minutes
  final Map<String, dynamic>? metadata;

  QuizAttempt({
    required this.id,
    required this.userId,
    required this.quizId,
    required this.answers,
    required this.score,
    required this.completedAt,
    required this.isPassed,
    this.timeSpent = 0,
    this.metadata,
  });

  factory QuizAttempt.fromJson(Map<String, dynamic> json) {
    return QuizAttempt(
      id: json['id'],
      userId: json['user_id'],
      quizId: json['quiz_id'],
      answers: Map<String, dynamic>.from(json['answers'] ?? {}),
      score: json['score']?.toDouble() ?? 0.0,
      completedAt: DateTime.parse(json['completed_at']),
      isPassed: json['is_passed'] ?? false,
      timeSpent: json['time_spent'] ?? 0,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'quiz_id': quizId,
      'answers': answers,
      'score': score,
      'completed_at': completedAt.toIso8601String(),
      'is_passed': isPassed,
      'time_spent': timeSpent,
      'metadata': metadata,
    };
  }
}

class LearningPath {
  final String id;
  final String title;
  final String description;
  final String category;
  final List<String> courseIds;
  final int estimatedDuration; // in minutes
  final String level;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? thumbnailUrl;
  final List<String> skills;
  final Map<String, dynamic>? metadata;

  LearningPath({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.courseIds,
    required this.estimatedDuration,
    required this.level,
    required this.isActive,
    required this.createdAt,
    this.updatedAt,
    this.thumbnailUrl,
    required this.skills,
    this.metadata,
  });

  factory LearningPath.fromJson(Map<String, dynamic> json) {
    return LearningPath(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      courseIds: List<String>.from(json['course_ids'] ?? []),
      estimatedDuration: json['estimated_duration'] ?? 0,
      level: json['level'],
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      thumbnailUrl: json['thumbnail_url'],
      skills: List<String>.from(json['skills'] ?? []),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'course_ids': courseIds,
      'estimated_duration': estimatedDuration,
      'level': level,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'thumbnail_url': thumbnailUrl,
      'skills': skills,
      'metadata': metadata,
    };
  }
}

class CourseRating {
  final String id;
  final String userId;
  final String courseId;
  final double rating;
  final String? review;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isPublic;
  final Map<String, dynamic>? metadata;

  CourseRating({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.rating,
    this.review,
    required this.createdAt,
    this.updatedAt,
    this.isPublic = true,
    this.metadata,
  });

  factory CourseRating.fromJson(Map<String, dynamic> json) {
    return CourseRating(
      id: json['id'],
      userId: json['user_id'],
      courseId: json['course_id'],
      rating: json['rating']?.toDouble() ?? 0.0,
      review: json['review'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      isPublic: json['is_public'] ?? true,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'course_id': courseId,
      'rating': rating,
      'review': review,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_public': isPublic,
      'metadata': metadata,
    };
  }
}

class Instructor {
  final String id;
  final String userId;
  final String bio;
  final String expertise;
  final List<String> qualifications;
  final double rating;
  final int totalCourses;
  final int totalStudents;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isVerified;
  final Map<String, dynamic>? metadata;

  Instructor({
    required this.id,
    required this.userId,
    required this.bio,
    required this.expertise,
    required this.qualifications,
    required this.rating,
    required this.totalCourses,
    required this.totalStudents,
    required this.createdAt,
    this.updatedAt,
    this.isVerified = false,
    this.metadata,
  });

  factory Instructor.fromJson(Map<String, dynamic> json) {
    return Instructor(
      id: json['id'],
      userId: json['user_id'],
      bio: json['bio'],
      expertise: json['expertise'],
      qualifications: List<String>.from(json['qualifications'] ?? []),
      rating: json['rating']?.toDouble() ?? 0.0,
      totalCourses: json['total_courses'] ?? 0,
      totalStudents: json['total_students'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      isVerified: json['is_verified'] ?? false,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'bio': bio,
      'expertise': expertise,
      'qualifications': qualifications,
      'rating': rating,
      'total_courses': totalCourses,
      'total_students': totalStudents,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_verified': isVerified,
      'metadata': metadata,
    };
  }
}

class Question {
  final String id;
  final String quizId;
  final String question;
  final List<String> options;
  final String correctAnswer;
  final String? explanation;
  final int orderIndex;
  final int points;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final Map<String, dynamic>? metadata;

  Question({
    required this.id,
    required this.quizId,
    required this.question,
    required this.options,
    required this.correctAnswer,
    this.explanation,
    required this.orderIndex,
    required this.points,
    required this.createdAt,
    this.updatedAt,
    this.metadata,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      quizId: json['quiz_id'],
      question: json['question'],
      options: List<String>.from(json['options'] ?? []),
      correctAnswer: json['correct_answer'],
      explanation: json['explanation'],
      orderIndex: json['order_index'] ?? 0,
      points: json['points'] ?? 1,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'quiz_id': quizId,
      'question': question,
      'options': options,
      'correct_answer': correctAnswer,
      'explanation': explanation,
      'order_index': orderIndex,
      'points': points,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'metadata': metadata,
    };
  }
}
