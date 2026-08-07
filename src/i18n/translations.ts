import type { Locale } from "@/i18n/config";

type TranslationPair = { fr: string; ar: string };

const phrases: Record<string, TranslationPair> = {
  "1–5 scale": { fr: "Échelle 1–5", ar: "مقياس 1–5" },
  "Absences": { fr: "Absences", ar: "الغيابات" },
  "Academic year label": { fr: "Libellé année scolaire", ar: "تسمية السنة الدراسية" },
  "Academic years": { fr: "Années scolaires", ar: "السنوات الدراسية" },
  "Access denied": { fr: "Accès refusé", ar: "تم رفض الوصول" },
  "Active periods": { fr: "Périodes actives", ar: "الفترات النشطة" },
  "Alert thresholds": { fr: "Seuils d’alerte", ar: "حدود التنبيهات" },
  "All changes": { fr: "Toutes les modifications", ar: "جميع التغييرات" },
  "All staff": { fr: "Tout le personnel", ar: "جميع الموظفين" },
  "Always notify parent for": { fr: "Toujours notifier le parent pour", ar: "أبلغ ولي الأمر دائمًا عن" },
  "Always round down": { fr: "Toujours arrondir à l’inférieur", ar: "التقريب دائمًا إلى الأسفل" },
  "Analysing and evaluating information": { fr: "Analyser et évaluer l’information", ar: "تحليل وتقييم المعلومات" },
  "Attendance types": { fr: "Types de présence", ar: "أنواع الحضور" },
  "Back to dashboard": { fr: "Retour au tableau de bord", ar: "العودة إلى لوحة القيادة" },
  "Balanced": { fr: "Équilibré", ar: "متوازن" },
  "Behaviour": { fr: "Comportement", ar: "السلوك" },
  "Behaviour alerts": { fr: "Alertes comportement", ar: "تنبيهات السلوك" },
  "Calendar, terms and current period": { fr: "Calendrier, trimestres et période en cours", ar: "التقويم والفصول الدراسية والفترة الحالية" },
  "Capacity": { fr: "Capacité", ar: "السعة" },
  "Capacity, rooms and homeroom teachers": { fr: "Capacité, salles et professeurs principaux", ar: "السعة والفصول ومعلمو الفصول" },
  "Changes to visibility should be reviewed by the school's data protection lead before production use.": { fr: "Les modifications de visibilité doivent être examinées par le responsable de la protection des données de l'école avant toute utilisation en production.", ar: "يجب مراجعة تغييرات الظهور من قبل مسؤول حماية البيانات في المدرسة قبل الاستخدام الإنتاجي." },
  "Check-in questions": { fr: "Questions de bilan", ar: "أسئلة التسجيل" },
  "Check-ins": { fr: "Bilans", ar: "التسجيلات" },
  "Class name": { fr: "Nom de la classe", ar: "اسم الفصل" },
  "Classes and grades": { fr: "Classes et niveaux", ar: "الفصول والصفوف" },
  "Code": { fr: "Code", ar: "الرمز" },
  "Cognitive": { fr: "Cognitif", ar: "معرفي" },
  "Colour": { fr: "Couleur", ar: "اللون" },
  "Competency name": { fr: "Nom de la compétence", ar: "اسم الكفاءة" },
  "Counts as attended": { fr: "Comptabilisé comme présent", ar: "يُحتسب كحضور" },
  "Counts toward attendance rate": { fr: "Comptabilisé dans le taux de présence", ar: "يُحتسب ضمن نسبة الحضور" },
  "Critical": { fr: "Critique", ar: "حرج" },
  "Critical thinking": { fr: "Pensée critique", ar: "التفكير النقدي" },

  "Date format": { fr: "Format de date", ar: "تنسيق التاريخ" },
  "Default language": { fr: "Langue par défaut", ar: "اللغة الافتراضية" },
  "Descriptive": { fr: "Descriptif", ar: "وصفي" },
  "Dimension": { fr: "Dimension", ar: "البُعد" },
  "Display order": { fr: "Ordre d’affichage", ar: "ترتيب العرض" },
  "Elective": { fr: "Optionnel", ar: "اختياري" },
  "Emoji scale": { fr: "Échelle d’émojis", ar: "مقياس الرموز التعبيرية" },
  "Enable RTL layout for Arabic": { fr: "Activer la mise en page RTL pour l’arabe", ar: "تفعيل التخطيط من اليمين لليسار للعربية" },
  "Enabled languages": { fr: "Langues activées", ar: "اللغات المفعلة" },
  "Energy": { fr: "Énergie", ar: "الطاقة" },
  "Evidence threshold": { fr: "Seuil de preuve", ar: "حد الأدلة" },
  "Explainable rules": { fr: "Règles explicables", ar: "قواعد قابلة للتفسير" },
  "Fine-grained per-data-type controls": { fr: "Contrôles fins par type de donnée", ar: "ضوابط دقيقة حسب نوع البيانات" },
  "Full": { fr: "Complet", ar: "كامل" },
  "Grade 7": { fr: "7e", ar: "الصف السابع" },
  "Grade 8": { fr: "8e", ar: "الصف الثامن" },
  "Grade 9": { fr: "9e", ar: "الصف التاسع" },
  "Grade level": { fr: "Niveau scolaire", ar: "المستوى الدراسي" },
  "Grading system": { fr: "Système de notation", ar: "نظام التقييم" },
  "Help request signal": { fr: "Signal d’aide demandée", ar: "إشارة طلب المساعدة" },
  "High": { fr: "Élevée", ar: "عالٍ" },
  "Homeroom teacher": { fr: "Professeur principal", ar: "معلم الفصل" },
  "How are you feeling today?": { fr: "Comment te sens-tu aujourd’hui ?", ar: "كيف تشعر اليوم؟" },
  "Languages": { fr: "Langues", ar: "اللغات" },
  "Letter A–F": { fr: "Lettres A–F", ar: "حروف A–F" },
  "Low": { fr: "Faible", ar: "منخفض" },
  "Low grades": { fr: "Notes faibles", ar: "الدرجات المنخفضة" },
  "Mathematics": { fr: "Mathématiques", ar: "الرياضيات" },
  "Max grade": { fr: "Note maximale", ar: "الدرجة القصوى" },
  "Max score": { fr: "Score maximal", ar: "الحد الأقصى للدرجة" },
  "Medium": { fr: "Moyenne", ar: "متوسط" },
  "Minimal": { fr: "Minimal", ar: "الحد الأدنى" },
  "Mood, energy, motivation, workload and understanding": { fr: "Humeur, énergie, motivation, charge de travail et compréhension", ar: "المزاج والطاقة والدافعية وعبء العمل والفهم" },
  "Multiple systems supported": { fr: "Plusieurs systèmes pris en charge", ar: "أنظمة متعددة مدعومة" },
  "Names, codes, colours and ordering": { fr: "Noms, codes, couleurs et ordre", ar: "الأسماء والرموز والألوان والترتيب" },
  "Notify": { fr: "Notifier", ar: "إشعار" },
  "Numeric /100": { fr: "Numérique /100", ar: "رقمي /100" },
  "Numeric /20": { fr: "Numérique /20", ar: "رقمي /20" },
  "Open text": { fr: "Texte libre", ar: "نص حر" },
  "Overall visibility": { fr: "Visibilité globale", ar: "الظهور العام" },
  "Parent visibility": { fr: "Visibilité parent", ar: "ظهور ولي الأمر" },
  "Passing grade": { fr: "Note de passage", ar: "درجة النجاح" },
  "Personal": { fr: "Personnel", ar: "شخصي" },
  "Present, absent, late and excused": { fr: "Présent, absent, retard et excusé", ar: "حاضر وغائب ومتأخر ومعذور" },
  "Privacy impact reminder": { fr: "Rappel sur l’impact confidentialité", ar: "تذكير بأثر الخصوصية" },
  "Question": { fr: "Question", ar: "السؤال" },
  "Response type": { fr: "Type de réponse", ar: "نوع الرد" },
  "Room number": { fr: "Numéro de salle", ar: "رقم القاعة" },
  "Round up from 0.5": { fr: "Arrondir à partir de 0.5", ar: "التقريب من 0.5" },
  "Rounding rules": { fr: "Règles d’arrondi", ar: "قواعد التقريب" },
  "RTL prepared for Arabic": { fr: "RTL prêt pour l’arabe", ar: "جاهز للعربية (RTL)" },
  "RTL support": { fr: "Support RTL", ar: "دعم RTL" },
  "Rule name": { fr: "Nom de la règle", ar: "اسم القاعدة" },
  "Scale type": { fr: "Type d’échelle", ar: "نوع المقياس" },
  "School settings": { fr: "Paramètres de l’école", ar: "إعدادات المدرسة" },
  "School-specific competency framework": { fr: "Cadre de compétences propre à l’école", ar: "إطار الكفاءات الخاص بالمدرسة" },
  "Severity": { fr: "Sévérité", ar: "الشدة" },
  "Signal timing and evidence thresholds": { fr: "Temporalité des signaux et seuils de preuve", ar: "توقيت الإشارات وحدود الأدلة" },
  "Social": { fr: "Social", ar: "اجتماعي" },
  "Subject code": { fr: "Code de la matière", ar: "رمز المادة" },
  "Subject name": { fr: "Nom de la matière", ar: "اسم المادة" },
  "Subjects": { fr: "Matières", ar: "المواد" },
  "Teacher + coordinator": { fr: "Enseignant + coordinateur", ar: "المعلم + المنسق" },
  "Teacher only": { fr: "Enseignant uniquement", ar: "المعلم فقط" },
  "Term 1": { fr: "Trimestre 1", ar: "الفصل الأول" },
  "Term 1 dates": { fr: "Dates du trimestre 1", ar: "تواريخ الفصل الأول" },
  "Term 2": { fr: "Trimestre 2", ar: "الفصل الثاني" },
  "Term 2 dates": { fr: "Dates du trimestre 2", ar: "تواريخ الفصل الثاني" },
  "Term 3": { fr: "Trimestre 3", ar: "الفصل الثالث" },
  "Term 3 dates": { fr: "Dates du trimestre 3", ar: "تواريخ الفصل الثالث" },
  "Truncate decimals": { fr: "Tronquer les décimales", ar: "إزالة الكسور العشرية" },
  "Type name": { fr: "Nom du type", ar: "اسم النوع" },
  "Understanding": { fr: "Compréhension", ar: "الفهم" },
  "Visible data types": { fr: "Types de données visibles", ar: "أنواع البيانات المرئية" },
  "Visible to parent": { fr: "Visible par le parent", ar: "مرئي لولي الأمر" },
  "Visible to student": { fr: "Visible par l’élève", ar: "مرئي للطالب" },
  "Visible to teacher": { fr: "Visible par l’enseignant", ar: "مرئي للمعلم" },
  "Workload": { fr: "Charge de travail", ar: "عبء العمل" },
  "Dashboard": { fr: "Tableau de bord", ar: "لوحة القيادة" },
  "Student": { fr: "Élève", ar: "طالب" },
  "Teacher": { fr: "Enseignant", ar: "معلم" },
  "Parent": { fr: "Parent", ar: "ولي الأمر" },
  "Principal": { fr: "Direction", ar: "مدير" },
  "Admin": { fr: "Administration", ar: "مسؤول" },
  "Super admin": { fr: "Super administrateur", ar: "مسؤول المنصة" },
  "School": { fr: "École", ar: "المدرسة" },
  "Live View": { fr: "Vue en direct", ar: "العرض المباشر" },
  "Analytics": { fr: "Analyses", ar: "التحليلات" },
  "Reports": { fr: "Rapports", ar: "التقارير" },
  "Classes": { fr: "Classes", ar: "الفصول" },
  "Students": { fr: "Élèves", ar: "الطلاب" },
  "Teachers": { fr: "Enseignants", ar: "المعلمون" },
  "Messages": { fr: "Messages", ar: "الرسائل" },
  "Configuration": { fr: "Configuration", ar: "الإعدادات" },
  "Today": { fr: "Aujourd’hui", ar: "اليوم" },
  "Homework": { fr: "Devoirs", ar: "الواجبات" },
  "Attendance": { fr: "Présence", ar: "الحضور" },
  "Observations": { fr: "Observations", ar: "الملاحظات" },
  "Assessments": { fr: "Évaluations", ar: "التقييمات" },
  "Weekly Review": { fr: "Revue hebdomadaire", ar: "المراجعة الأسبوعية" },
  "Progress": { fr: "Progression", ar: "التقدم" },
  "Goals": { fr: "Objectifs", ar: "الأهداف" },
  "Feedback": { fr: "Retours", ar: "التغذية الراجعة" },
  "Achievements": { fr: "Réussites", ar: "الإنجازات" },
  "Help": { fr: "Aide", ar: "المساعدة" },
  "Copilot": { fr: "Copilote", ar: "المساعد الذكي" },
  "Schools": { fr: "Écoles", ar: "المدارس" },
  "Users": { fr: "Utilisateurs", ar: "المستخدمون" },
  "Audit Log": { fr: "Journal d’audit", ar: "سجل التدقيق" },
  "My Children": { fr: "Mes enfants", ar: "أبنائي" },
  "Overview": { fr: "Vue d’ensemble", ar: "نظرة عامة" },
  "Timeline": { fr: "Chronologie", ar: "الخط الزمني" },
  "Academics": { fr: "Scolarité", ar: "المستوى الدراسي" },
  "Engagement": { fr: "Engagement", ar: "المشاركة" },
  "Wellbeing": { fr: "Bien-être", ar: "الرفاه" },
  "Competencies": { fr: "Compétences", ar: "الكفاءات" },
  "Support": { fr: "Accompagnement", ar: "الدعم" },
  "EXECUTIVE": { fr: "DIRECTION", ar: "الإدارة" },
  "TEACHING": { fr: "ENSEIGNEMENT", ar: "التدريس" },
  "MY LEARNING": { fr: "MON APPRENTISSAGE", ar: "تعلّمي" },
  "FAMILY": { fr: "FAMILLE", ar: "الأسرة" },
  "PEOPLE": { fr: "PERSONNES", ar: "الأشخاص" },
  "PLATFORM": { fr: "PLATEFORME", ar: "المنصة" },
  "Student success intelligence": { fr: "Intelligence au service de la réussite", ar: "ذكاء نجاح الطالب" },
  "Good morning, Nadia.": { fr: "Bonjour, Nadia.", ar: "صباح الخير، نادية." },
  "Here is the school pulse for Monday, 27 July. Positive progress and support signals are shown with equal priority.": { fr: "Voici la dynamique de l’école pour le lundi 27 juillet. Les progrès positifs et les signaux d’accompagnement bénéficient de la même priorité.", ar: "إليك مؤشر المدرسة ليوم الاثنين 27 يوليو. يُعرض التقدم الإيجابي وإشارات الدعم بالأولوية نفسها." },
  "Good morning": { fr: "Bonjour", ar: "صباح الخير" },
  "This week": { fr: "Cette semaine", ar: "هذا الأسبوع" },
  "Last 30 days": { fr: "30 derniers jours", ar: "آخر 30 يومًا" },
  "Current term": { fr: "Trimestre en cours", ar: "الفصل الدراسي الحالي" },
  "Create action": { fr: "Créer une action", ar: "إنشاء إجراء" },
  "Action title": { fr: "Titre de l’action", ar: "عنوان الإجراء" },
  "What needs to happen?": { fr: "Que faut-il faire ?", ar: "ما الذي يجب القيام به؟" },
  "Attendance today": { fr: "Présence aujourd’hui", ar: "الحضور اليوم" },
  "Homework completion": { fr: "Devoirs terminés", ar: "إنجاز الواجبات" },
  "Across 6 active classes": { fr: "Dans 6 classes actives", ar: "عبر 6 فصول نشطة" },
  "Up across four classes": { fr: "En hausse dans quatre classes", ar: "تحسن في أربعة فصول" },
  "Explainable combined signals": { fr: "Signaux combinés et explicables", ar: "إشارات مركبة قابلة للتفسير" },
  "Six-week evolution": { fr: "Évolution sur six semaines", ar: "تطور خلال ستة أسابيع" },
  "Engagement points": { fr: "Points d’engagement", ar: "نقاط المشاركة" },
  "Student check-ins": { fr: "Bilans des élèves", ar: "تسجيلات الطلاب" },
  "One class declined this week": { fr: "Une classe a reculé cette semaine", ar: "تراجع فصل واحد هذا الأسبوع" },
  "5 late arrivals today": { fr: "5 retards aujourd’hui", ar: "5 حالات تأخر اليوم" },
  "8 active plans": { fr: "8 plans actifs", ar: "8 خطط نشطة" },
  "3 review dates due this week": { fr: "3 dates de revue cette semaine", ar: "3 مواعيد مراجعة هذا الأسبوع" },
  "Recent activity across the school": { fr: "Activité récente dans toute l’école", ar: "النشاط الأخير في المدرسة" },
  "Signals are suggestions, never labels": { fr: "Les signaux sont des suggestions, jamais des étiquettes", ar: "الإشارات اقتراحات وليست تصنيفات" },
  "Recognition sustains momentum": { fr: "La reconnaissance entretient la dynamique", ar: "التقدير يعزز الاستمرارية" },
  "Open a class squad dashboard in one click": { fr: "Ouvrez le tableau d’une classe en un clic", ar: "افتح لوحة الفصل بنقرة واحدة" },
  "Items requiring review": { fr: "Éléments à examiner", ar: "عناصر تحتاج إلى مراجعة" },
  "Keep support plans moving": { fr: "Faire avancer les plans d’accompagnement", ar: "مواصلة تقدم خطط الدعم" },
  "Students to check in": { fr: "Élèves à contacter", ar: "طلاب يحتاجون إلى متابعة" },
  "School progress pulse": { fr: "Dynamique de progression de l’école", ar: "مؤشر تقدم المدرسة" },
  "Healthy momentum": { fr: "Dynamique positive", ar: "زخم إيجابي" },
  "Attendance pattern": { fr: "Tendance de présence", ar: "نمط الحضور" },
  "Open interventions": { fr: "Accompagnements ouverts", ar: "خطط الدعم المفتوحة" },
  "Live today": { fr: "En direct aujourd’hui", ar: "مباشر اليوم" },
  "Open live view": { fr: "Ouvrir la vue en direct", ar: "فتح العرض المباشر" },
  "Students to check in with": { fr: "Élèves à contacter", ar: "طلاب يحتاجون إلى متابعة" },
  "View reasons": { fr: "Voir les raisons", ar: "عرض الأسباب" },
  "Positive highlights": { fr: "Points forts positifs", ar: "أبرز النقاط الإيجابية" },
  "All classes": { fr: "Toutes les classes", ar: "كل الفصول" },
  "Upcoming homework": { fr: "Devoirs à venir", ar: "الواجبات القادمة" },
  "Open workspace": { fr: "Ouvrir l’espace", ar: "فتح مساحة العمل" },
  "Upcoming actions": { fr: "Actions à venir", ar: "الإجراءات القادمة" },
  "Today’s schedule": { fr: "Programme du jour", ar: "برنامج اليوم" },
  "Schedule, attendance and quick actions for the current day.": { fr: "Programme, présence et actions rapides pour la journée.", ar: "البرنامج والحضور والإجراءات السريعة لليوم." },
  "Priority actions": { fr: "Actions prioritaires", ar: "الإجراءات ذات الأولوية" },
  "Open action": { fr: "Ouvrir l’action", ar: "فتح الإجراء" },
  "Create assignment": { fr: "Créer un devoir", ar: "إنشاء واجب" },
  "Assignments, submissions and feedback in one workspace.": { fr: "Devoirs, rendus et retours dans un même espace.", ar: "الواجبات والتسليمات والملاحظات في مساحة واحدة." },
  "Assignment title": { fr: "Titre du devoir", ar: "عنوان الواجب" },
  "Instructions": { fr: "Consignes", ar: "التعليمات" },
  "All assignments": { fr: "Tous les devoirs", ar: "كل الواجبات" },
  "Published": { fr: "Publié", ar: "منشور" },
  "Draft": { fr: "Brouillon", ar: "مسودة" },
  "Review submissions": { fr: "Examiner les rendus", ar: "مراجعة التسليمات" },
  "Mark all present": { fr: "Tous présents", ar: "تحديد الجميع حاضرين" },
  "Save register": { fr: "Enregistrer l’appel", ar: "حفظ سجل الحضور" },
  "Saved locally": { fr: "Enregistré localement", ar: "تم الحفظ محليًا" },
  "Present": { fr: "Présent", ar: "حاضر" },
  "Absent": { fr: "Absent", ar: "غائب" },
  "Late": { fr: "En retard", ar: "متأخر" },
  "Excused": { fr: "Excusé", ar: "بعذر" },
  "Add observation": { fr: "Ajouter une observation", ar: "إضافة ملاحظة" },
  "Capture quick and detailed classroom observations.": { fr: "Saisissez des observations rapides ou détaillées en classe.", ar: "سجّل ملاحظات صفية سريعة أو مفصلة." },
  "Category": { fr: "Catégorie", ar: "الفئة" },
  "Sentiment": { fr: "Appréciation", ar: "الانطباع" },
  "Positive": { fr: "Positif", ar: "إيجابي" },
  "Neutral": { fr: "Neutre", ar: "محايد" },
  "Needs attention": { fr: "Nécessite une attention", ar: "يحتاج إلى اهتمام" },
  "Create assessment": { fr: "Créer une évaluation", ar: "إنشاء تقييم" },
  "Quizzes, tests, projects and grade-entry workflows.": { fr: "Quiz, contrôles, projets et saisie des notes.", ar: "اختبارات ومشاريع ومسارات إدخال الدرجات." },
  "Assessment title": { fr: "Titre de l’évaluation", ar: "عنوان التقييم" },
  "Enter grades": { fr: "Saisir les notes", ar: "إدخال الدرجات" },
  "Share summary": { fr: "Partager le résumé", ar: "مشاركة الملخص" },
  "Automatic summary grounded in attendance, homework, observations and student check-ins.": { fr: "Résumé automatique fondé sur la présence, les devoirs, les observations et les bilans des élèves.", ar: "ملخص تلقائي مبني على الحضور والواجبات والملاحظات وتسجيلات الطلاب." },
  "Mark reviewed": { fr: "Marquer comme examiné", ar: "تحديد كمراجَع" },
  "Reviewed": { fr: "Examiné", ar: "تمت المراجعة" },
  "Positive evolution": { fr: "Évolution positive", ar: "تطور إيجابي" },
  "Attention suggested": { fr: "Attention suggérée", ar: "يُقترح الانتباه" },
  "Privacy reminder": { fr: "Rappel de confidentialité", ar: "تذكير بالخصوصية" },
  "Action suggested": { fr: "Action suggérée", ar: "إجراء مقترح" },
  "Watch": { fr: "À surveiller", ar: "للمراقبة" },
  "Stable": { fr: "Stable", ar: "مستقر" },
  "Improving": { fr: "En amélioration", ar: "يتحسن" },
  "All students": { fr: "Tous les élèves", ar: "كل الطلاب" },
  "Search student": { fr: "Rechercher un élève", ar: "البحث عن طالب" },
  "Search students": { fr: "Rechercher des élèves", ar: "البحث عن الطلاب" },
  "Search classes": { fr: "Rechercher des classes", ar: "البحث عن الفصول" },
  "Search teachers": { fr: "Rechercher des enseignants", ar: "البحث عن المعلمين" },
  "Search conversations": { fr: "Rechercher des conversations", ar: "البحث في المحادثات" },
  "Secure collaboration between school staff, students and families.": { fr: "Collaboration sécurisée entre l’équipe scolaire, les élèves et les familles.", ar: "تعاون آمن بين طاقم المدرسة والطلاب والأسر." },
  "Search report type": { fr: "Rechercher un type de rapport", ar: "البحث عن نوع تقرير" },
  "Filters": { fr: "Filtres", ar: "عوامل التصفية" },
  "All": { fr: "Tous", ar: "الكل" },
  "Active": { fr: "Actif", ar: "نشط" },
  "Attention": { fr: "Attention", ar: "انتباه" },
  "Open": { fr: "Ouvrir", ar: "فتح" },
  "Manage": { fr: "Gérer", ar: "إدارة" },
  "New message": { fr: "Nouveau message", ar: "رسالة جديدة" },
  "Start a conversation": { fr: "Démarrer une conversation", ar: "بدء محادثة" },
  "Recipient": { fr: "Destinataire", ar: "المستلم" },
  "Subject": { fr: "Objet", ar: "الموضوع" },
  "Message": { fr: "Message", ar: "الرسالة" },
  "Write a message…": { fr: "Écrire un message…", ar: "اكتب رسالة…" },
  "Secure": { fr: "Sécurisé", ar: "آمن" },
  "Available templates": { fr: "Modèles disponibles", ar: "القوالب المتاحة" },
  "Generate concise student, class and school reports with privacy-aware content.": { fr: "Générez des rapports concis sur les élèves, les classes et l’école, respectueux de la confidentialité.", ar: "أنشئ تقارير موجزة للطلاب والفصول والمدرسة مع مراعاة الخصوصية." },
  "Generated this month": { fr: "Générés ce mois-ci", ar: "تم إنشاؤها هذا الشهر" },
  "Generate preview": { fr: "Générer un aperçu", ar: "إنشاء معاينة" },
  "Ready": { fr: "Prêt", ar: "جاهز" },
  "Export CSV": { fr: "Exporter en CSV", ar: "تصدير CSV" },
  "Adapt Student360 to the school's educational system without hard-coded assumptions.": { fr: "Adaptez Student360 au système pédagogique de l’école sans hypothèses figées.", ar: "كيّف Student360 مع النظام التعليمي للمدرسة دون افتراضات ثابتة." },
  "Save changes": { fr: "Enregistrer", ar: "حفظ التغييرات" },
  "Saved": { fr: "Enregistré", ar: "تم الحفظ" },
  "Cancel": { fr: "Annuler", ar: "إلغاء" },
  "Display name": { fr: "Nom affiché", ar: "اسم العرض" },
  "Default option": { fr: "Option par défaut", ar: "الخيار الافتراضي" },
  "Visibility and permissions": { fr: "Visibilité et autorisations", ar: "الظهور والصلاحيات" },
  "Status": { fr: "Statut", ar: "الحالة" },
  "Administration": { fr: "Administration", ar: "الإدارة" },
  "Audit log": { fr: "Journal d’audit", ar: "سجل التدقيق" },
  "Security and privacy trail for sensitive access and platform actions.": { fr: "Traçabilité de sécurité et de confidentialité pour les accès sensibles et les actions de la plateforme.", ar: "سجل أمان وخصوصية لعمليات الوصول الحساسة وإجراءات المنصة." },
  "Events today": { fr: "Événements aujourd’hui", ar: "أحداث اليوم" },
  "Sensitive views": { fr: "Consultations sensibles", ar: "العروض الحساسة" },
  "Exports": { fr: "Exports", ar: "عمليات التصدير" },
  "Time": { fr: "Heure", ar: "الوقت" },
  "Actor": { fr: "Auteur", ar: "الفاعل" },
  "Action": { fr: "Action", ar: "الإجراء" },
  "Details": { fr: "Détails", ar: "التفاصيل" },
  "Role": { fr: "Rôle", ar: "الدور" },
  "School live": { fr: "École en direct", ar: "المدرسة مباشرة" },
  "A privacy-conscious pulse of attendance, check-ins and learning events happening today.": { fr: "Une vue respectueuse de la confidentialité sur la présence, les bilans et les événements pédagogiques du jour.", ar: "مؤشر يراعي الخصوصية للحضور والتسجيلات والأحداث التعليمية اليوم." },
  "All events": { fr: "Tous les événements", ar: "كل الأحداث" },
  "Live now": { fr: "En direct", ar: "مباشر الآن" },
  "Class pulse": { fr: "Dynamique de la classe", ar: "مؤشر الفصل" },
  "Positive pulse": { fr: "Dynamique positive", ar: "مؤشر إيجابي" },
  "Support requests": { fr: "Demandes d’aide", ar: "طلبات الدعم" },
  "Class activity map": { fr: "Carte d’activité de la classe", ar: "خريطة نشاط الفصل" },
  "Whole school": { fr: "Toute l’école", ar: "المدرسة بأكملها" },
  "Explore trends and explainable signals without ranking students.": { fr: "Explorez les tendances et les signaux explicables sans classer les élèves.", ar: "استكشف الاتجاهات والإشارات القابلة للتفسير دون ترتيب الطلاب." },
  "Positive progress": { fr: "Progrès positifs", ar: "تقدم إيجابي" },
  "Signals to explore": { fr: "Signaux à explorer", ar: "إشارات للاستكشاف" },
  "Evidence": { fr: "Éléments probants", ar: "الأدلة" },
  "Ask Copilot": { fr: "Interroger le copilote", ar: "اسأل المساعد الذكي" },
  "Ask grounded questions about visible school data. Responses are deterministic in this demo.": { fr: "Posez des questions fondées sur les données scolaires visibles. Les réponses sont déterministes dans cette démo.", ar: "اطرح أسئلة مبنية على بيانات المدرسة الظاهرة. الإجابات حتمية في هذا العرض." },
  "Suggested questions": { fr: "Questions suggérées", ar: "أسئلة مقترحة" },
  "Send": { fr: "Envoyer", ar: "إرسال" },
  "Add goal": { fr: "Ajouter un objectif", ar: "إضافة هدف" },
  "New goal": { fr: "Nouvel objectif", ar: "هدف جديد" },
  "Goal title": { fr: "Titre de l’objectif", ar: "عنوان الهدف" },
  "Pause": { fr: "Mettre en pause", ar: "إيقاف مؤقت" },
  "Complete": { fr: "Terminer", ar: "إكمال" },
  "Completed": { fr: "Terminé", ar: "مكتمل" },
  "Acknowledged": { fr: "Pris en compte", ar: "تم الاطلاع" },
  "Acknowledge": { fr: "Prendre en compte", ar: "تأكيد الاطلاع" },
  "Request help": { fr: "Demander de l’aide", ar: "طلب المساعدة" },
  "Submit request": { fr: "Envoyer la demande", ar: "إرسال الطلب" },
  "Request sent": { fr: "Demande envoyée", ar: "تم إرسال الطلب" },
  "Confidential": { fr: "Confidentiel", ar: "سري" },
  "Your progress": { fr: "Votre progression", ar: "تقدمك" },
  "A multidimensional view of your learning, participation and habits.": { fr: "Une vue multidimensionnelle de vos apprentissages, de votre participation et de vos habitudes.", ar: "نظرة متعددة الأبعاد على تعلمك ومشاركتك وعاداتك." },
  "Your goals": { fr: "Vos objectifs", ar: "أهدافك" },
  "Create, update and celebrate meaningful learning goals.": { fr: "Créez, mettez à jour et célébrez des objectifs d’apprentissage utiles.", ar: "أنشئ أهداف تعلم ذات معنى وحدّثها واحتفل بها." },
  "Teacher feedback": { fr: "Retours des enseignants", ar: "ملاحظات المعلمين" },
  "Encouragement and actionable feedback from your teachers.": { fr: "Encouragements et retours concrets de vos enseignants.", ar: "تشجيع وملاحظات عملية من معلميك." },
  "Achievement gallery": { fr: "Galerie des réussites", ar: "معرض الإنجازات" },
  "Milestones, competencies and recognitions worth celebrating.": { fr: "Étapes, compétences et reconnaissances à célébrer.", ar: "محطات وكفاءات وتقديرات تستحق الاحتفال." },
  "Student profile": { fr: "Profil de l’élève", ar: "ملف الطالب" },
  "A balanced 360° view of learning, engagement and wellbeing.": { fr: "Une vue équilibrée à 360° des apprentissages, de l’engagement et du bien-être.", ar: "نظرة متوازنة بزاوية 360° على التعلم والمشاركة والرفاه." },
  "Quick observation": { fr: "Observation rapide", ar: "ملاحظة سريعة" },
  "Add support action": { fr: "Ajouter une action d’aide", ar: "إضافة إجراء دعم" },
  "Contact family": { fr: "Contacter la famille", ar: "التواصل مع الأسرة" },
  "Documents": { fr: "Documents", ar: "المستندات" },
  "Parent input": { fr: "Contribution familiale", ar: "مساهمة الأسرة" },
  "Support plan": { fr: "Plan d’accompagnement", ar: "خطة الدعم" },
  "Latest activity": { fr: "Activité récente", ar: "أحدث الأنشطة" },
  "Academic": { fr: "Scolaire", ar: "أكاديمي" },
  "Motivation": { fr: "Motivation", ar: "الدافعية" },
  "Mood": { fr: "Humeur", ar: "المزاج" },
  "School overview": { fr: "Vue d’ensemble de l’école", ar: "نظرة عامة على المدرسة" },
  "Class overview": { fr: "Vue d’ensemble de la classe", ar: "نظرة عامة على الفصل" },
  "Room": { fr: "Salle", ar: "القاعة" },
  "School year": { fr: "Année scolaire", ar: "السنة الدراسية" },
  "Age": { fr: "Âge", ar: "العمر" },
  "Advisor": { fr: "Référente", ar: "المرشدة" },
  "Optional note": { fr: "Note facultative", ar: "ملاحظة اختيارية" },
  "Support action or follow-up": { fr: "Action d’accompagnement ou suivi", ar: "إجراء دعم أو متابعة" },
  "Add action": { fr: "Ajouter une action", ar: "إضافة إجراء" },
  "Quick input": { fr: "Saisie rapide", ar: "إدخال سريع" },
  "Add quick input": { fr: "Ajouter une saisie rapide", ar: "إضافة إدخال سريع" },
  "Priority": { fr: "Priorité", ar: "أولوية" },
  "Respond to Maya's help request": { fr: "Répondre à la demande d’aide de Maya", ar: "الرد على طلب المساعدة من مايا" },
  "Review 8 homework submissions": { fr: "Examiner 8 devoirs rendus", ar: "مراجعة 8 واجبات مسلمة" },
  "Complete Grade 9B attendance": { fr: "Terminer l’appel de la 9e B", ar: "إكمال حضور الصف التاسع ب" },
  "Monday, 27 July · Your schedule, class pulse and priority actions.": { fr: "Lundi 27 juillet · Votre programme, la dynamique des classes et les actions prioritaires.", ar: "الاثنين 27 يوليو · برنامجك ومؤشر الفصل والإجراءات ذات الأولوية." },
  "Teacher directory": { fr: "Annuaire des enseignants", ar: "دليل المعلمين" },
  "Student directory": { fr: "Annuaire des élèves", ar: "دليل الطلاب" },
  "Sign in": { fr: "Se connecter", ar: "تسجيل الدخول" },
  "Welcome back. Enter your school email and password.": { fr: "Bon retour. Saisissez votre e-mail scolaire et votre mot de passe.", ar: "مرحبًا بعودتك. أدخل بريدك المدرسي وكلمة المرور." },
  "Signing in…": { fr: "Connexion…", ar: "جارٍ تسجيل الدخول…" },
  "Close search": { fr: "Fermer la recherche", ar: "إغلاق البحث" },
  "Email address": { fr: "Adresse e-mail", ar: "البريد الإلكتروني" },
  "Password": { fr: "Mot de passe", ar: "كلمة المرور" },
  "Remember me": { fr: "Se souvenir de moi", ar: "تذكرني" },
  "Forgot password?": { fr: "Mot de passe oublié ?", ar: "هل نسيت كلمة المرور؟" },
  "Demo accounts": { fr: "Comptes de démonstration", ar: "حسابات تجريبية" },
  "Invalid email or password": { fr: "E-mail ou mot de passe incorrect", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
  "Account preferences": { fr: "Préférences du compte", ar: "تفضيلات الحساب" },
  "Sign out": { fr: "Se déconnecter", ar: "تسجيل الخروج" },
  "Signing out…": { fr: "Déconnexion…", ar: "جارٍ تسجيل الخروج…" },
  "Notifications": { fr: "Notifications", ar: "الإشعارات" },
  "Mark all read": { fr: "Tout marquer comme lu", ar: "تحديد الكل كمقروء" },
  "Start typing a student, class or teacher name.": { fr: "Saisissez le nom d’un élève, d’une classe ou d’un enseignant.", ar: "اكتب اسم طالب أو فصل أو معلم." },
  "No matching result.": { fr: "Aucun résultat correspondant.", ar: "لا توجد نتيجة مطابقة." },
  "Search students, classes or teachers…": { fr: "Rechercher des élèves, classes ou enseignants…", ar: "البحث عن طلاب أو فصول أو معلمين…" },
  "Toggle theme": { fr: "Changer de thème", ar: "تبديل المظهر" },
  "Open notifications": { fr: "Ouvrir les notifications", ar: "فتح الإشعارات" },
  "Close notifications": { fr: "Fermer les notifications", ar: "إغلاق الإشعارات" },
  "Open account menu": { fr: "Ouvrir le menu du compte", ar: "فتح قائمة الحساب" },
  "Expand sidebar": { fr: "Déployer la barre latérale", ar: "توسيع الشريط الجانبي" },
  "Collapse sidebar": { fr: "Réduire la barre latérale", ar: "طي الشريط الجانبي" },
  "Open navigation": { fr: "Ouvrir la navigation", ar: "فتح التنقل" },
  "Language": { fr: "Langue", ar: "اللغة" },
  "Network error": { fr: "Erreur réseau", ar: "خطأ في الشبكة" },
  "Searching…": { fr: "Recherche…", ar: "جارٍ البحث…" },
  "English": { fr: "Anglais", ar: "الإنجليزية" },
  "French": { fr: "Français", ar: "الفرنسية" },
  "Arabic": { fr: "Arabe", ar: "العربية" },
  "Could not save language. Please try again.": { fr: "Impossible d’enregistrer la langue. Réessayez.", ar: "تعذر حفظ اللغة. يرجى المحاولة مرة أخرى." },
  "Could not sign out. Please try again.": { fr: "Impossible de se déconnecter. Réessayez.", ar: "تعذر تسجيل الخروج. يرجى المحاولة مرة أخرى." },
  "GENERAL": { fr: "Général", ar: "عام" },
  "ACADEMIC": { fr: "Académique", ar: "أكاديمي" },
  "WELLBEING": { fr: "Bien-être", ar: "الرفاهية" },
  "ATTENDANCE": { fr: "Présence", ar: "الحضور" },
  "HOMEWORK": { fr: "Devoirs", ar: "الواجبات" },
  "ADMIN": { fr: "Administratif", ar: "إداري" },
  "Person": { fr: "Personne", ar: "شخص" },
  "Conversation": { fr: "Conversation", ar: "محادثة" },
  "Administrative": { fr: "Administratif", ar: "إداري" },
  "Remove": { fr: "Retirer", ar: "إزالة" },
  "Sending…": { fr: "Envoi…", ar: "جارٍ الإرسال…" },
  "No conversations yet": { fr: "Aucune conversation pour le moment", ar: "لا توجد محادثات بعد" },
  "Select a conversation": { fr: "Sélectionnez une conversation", ar: "حدد محادثة" },
  "Choose a conversation to start reading.": { fr: "Choisissez une conversation pour commencer à lire.", ar: "اختر محادثة لبدء القراءة." },
  "About (optional)": { fr: "À propos de (facultatif)", ar: "حول (اختياري)" },
  "Not specified": { fr: "Non précisé", ar: "غير محدد" },
  "Message all families of this class.": { fr: "Envoyer à toutes les familles de cette classe.", ar: "إرسال إلى جميع أسر هذا الفصل." },
  "Search people…": { fr: "Rechercher des personnes…", ar: "البحث عن أشخاص…" },
  "Could not send your message. Please try again.": { fr: "Impossible d’envoyer votre message. Réessayez.", ar: "تعذر إرسال رسالتك. يرجى المحاولة مرة أخرى." },
  "Could not load this conversation.": { fr: "Impossible de charger cette conversation.", ar: "تعذر تحميل هذه المحادثة." },

  // dashboard-page.tsx — role-based live dashboard
  "Good afternoon": { fr: "Bon après-midi", ar: "مساء الخير" },
  "Good evening": { fr: "Bonsoir", ar: "مساء الخير" },
  "Active roster": { fr: "Effectif actif", ar: "القائمة النشطة" },
  "Active teaching staff": { fr: "Personnel enseignant actif", ar: "الهيئة التعليمية النشطة" },
  "Active learning plans": { fr: "Plans d’accompagnement actifs", ar: "خطط دعم نشطة" },
  "Active tenants": { fr: "Écoles actives", ar: "مدارس نشطة" },
  "Active users": { fr: "Utilisateurs actifs", ar: "مستخدمون نشطون" },
  "Assigned classes": { fr: "Classes attribuées", ar: "الفصول المسندة" },
  "Check-ins today": { fr: "Bilans du jour", ar: "تسجيلات اليوم" },
  "done": { fr: "faits", ar: "منجزة" },
  "due": { fr: "à venir", ar: "قادم" },
  "Done": { fr: "Fait", ar: "منجز" },
  "Partial": { fr: "Partiel", ar: "جزئي" },
  "Not done": { fr: "Non fait", ar: "لم يُنجز" },
  "Need help": { fr: "Besoin d’aide", ar: "بحاجة إلى مساعدة" },
  "Enabled accounts": { fr: "Comptes activés", ar: "حسابات مفعلة" },
  "In your inbox": { fr: "Dans votre messagerie", ar: "في صندوق الوارد" },
  "late arrivals today": { fr: "arrivées en retard aujourd’hui", ar: "تأخرات اليوم" },
  "Latest sign-ins across the platform": { fr: "Dernières connexions sur la plateforme", ar: "آخر عمليات تسجيل الدخول عبر المنصة" },
  "Live indicators": { fr: "Indicateurs en direct", ar: "مؤشرات مباشرة" },
  "My classes": { fr: "Mes classes", ar: "فصولي" },
  "My goals": { fr: "Mes objectifs", ar: "أهدافي" },
  "My students": { fr: "Mes élèves", ar: "طلابي" },
  "No active goals": { fr: "Aucun objectif actif", ar: "لا توجد أهداف نشطة" },
  "No attendance record yet today": { fr: "Aucun relevé de présence aujourd’hui", ar: "لا يوجد سجل حضور اليوم بعد" },
  "No check-in yet today": { fr: "Pas encore de bilan aujourd’hui", ar: "لا يوجد تسجيل اليوم بعد" },
  "No children linked to your account": { fr: "Aucun enfant lié à votre compte", ar: "لا يوجد أطفال مرتبطون بحسابك" },
  "No grades published yet": { fr: "Aucune note publiée", ar: "لا توجد درجات منشورة بعد" },
  "No highlights yet this week": { fr: "Aucun point fort cette semaine", ar: "لا توجد نقاط بارزة هذا الأسبوع" },
  "No inputs shared yet": { fr: "Aucun message partagé", ar: "لا توجد مشاركات بعد" },
  "No recent activity yet": { fr: "Aucune activité récente", ar: "لا يوجد نشاط حديث بعد" },
  "No recent logins": { fr: "Aucune connexion récente", ar: "لا توجد عمليات دخول حديثة" },
  "No students need attention right now": { fr: "Aucun élève ne nécessite d’attention pour le moment", ar: "لا يوجد طلاب يحتاجون إلى متابعة حالياً" },
  "No upcoming homework": { fr: "Aucun devoir à venir", ar: "لا توجد واجبات قادمة" },
  "Open alerts": { fr: "Alertes ouvertes", ar: "تنبيهات مفتوحة" },
  "Recent achievements": { fr: "Réalisations récentes", ar: "إنجازات حديثة" },
  "Recent activity": { fr: "Activité récente", ar: "نشاط حديث" },
  "Recent activity across your children": { fr: "Activité récente de vos enfants", ar: "النشاط الأخير لأطفالك" },
  "Recent activity from your students": { fr: "Activité récente de vos élèves", ar: "النشاط الأخير لطلابك" },
  "Recent family inputs": { fr: "Messages récents de la famille", ar: "مشاركات العائلة الأخيرة" },
  "Recent grades": { fr: "Notes récentes", ar: "درجات حديثة" },
  "Recent logins": { fr: "Connexions récentes", ar: "عمليات دخول حديثة" },
  "Reply to parent messages": { fr: "Répondre aux messages des parents", ar: "الرد على رسائل أولياء الأمور" },
  "Review intervention plans": { fr: "Examiner les plans d’accompagnement", ar: "مراجعة خطط الدعم" },
  "Signals requiring follow-up": { fr: "Signaux nécessitant un suivi", ar: "إشارات تتطلب متابعة" },
  "To review": { fr: "À examiner", ar: "للمراجعة" },
  "Unread messages": { fr: "Messages non lus", ar: "رسائل غير مقروءة" },
  "What you shared with the school": { fr: "Ce que vous avez partagé avec l’école", ar: "ما شاركته مع المدرسة" },
  "active goals": { fr: "objectifs actifs", ar: "أهداف نشطة" },
  "active plans": { fr: "plans actifs", ar: "خطط نشطة" },
  "Homework support": { fr: "Aide aux devoirs", ar: "مساعدة في الواجبات" },
  "Info for school": { fr: "Information pour l’école", ar: "معلومة للمدرسة" },
  "Acknowledgement": { fr: "Accusé de réception", ar: "إقرار بالاستلام" },
  "Message to teacher": { fr: "Message à l’enseignant", ar: "رسالة إلى المعلم" },
  "Here is the school pulse. Positive progress and support signals are shown with equal priority.": { fr: "Voici la dynamique de l’école. Progrès positifs et signaux de soutien sont présentés à égalité de priorité.", ar: "إليك مؤشر المدرسة. التقدم الإيجابي وإشارات الدعم معروضان بأولوية متساوية." },
  "Your classes, your students’ signals and homework to review in one place.": { fr: "Vos classes, les signaux de vos élèves et les devoirs à examiner, réunis au même endroit.", ar: "فصولك وإشارات طلابك والواجبات للمراجعة في مكان واحد." },
  "The wellbeing pulse of the school, focused on check-ins and support plans.": { fr: "Le pouls du bien-être de l’école, axé sur les bilans et les plans d’accompagnement.", ar: "مؤشر رفاهية المدرسة، مركز على التسجيلات وخطط الدعم." },
  "A calm, practical overview of what matters today for your children.": { fr: "Une vue d’ensemble calme et pratique de ce qui compte aujourd’hui pour vos enfants.", ar: "نظرة عامة هادئة وعملية لما يهم أطفالك اليوم." },
  "Your day at a glance: check-in, homework, grades and goals.": { fr: "Votre journée en un coup d’œil : bilan, devoirs, notes et objectifs.", ar: "يومك في لمحة: التسجيل والواجبات والدرجات والأهداف." },
  "Platform overview across every school.": { fr: "Vue d’ensemble de la plateforme sur toutes les écoles.", ar: "نظرة عامة على المنصة عبر جميع المدارس." },
};

const replacements: Array<[RegExp, (locale: Locale, match: string, ...groups: string[]) => string | undefined]> = [
  [/^(\d+) unread$/, (locale, _match, count) => locale === "fr" ? `${count} non lues` : `${count} غير مقروءة`],
  [/^(\d+) students$/, (locale, _match, count) => locale === "fr" ? `${count} élèves` : `${count} طالبًا`],
  [/^(\d+) participants$/, (locale, _match, count) => locale === "fr" ? `${count} participants` : `${count} مشاركًا`],
  [/^Grade ([789])([AB])$/, (locale, _match, grade, section) => locale === "fr" ? `${grade}e ${section}` : `الصف ${grade === "7" ? "السابع" : grade === "8" ? "الثامن" : "التاسع"} ${section === "A" ? "أ" : "ب"}`],
  [/^(\d+) students show combined weak signals$/, (locale, _match, count) => locale === "fr" ? `${count} élèves présentent des signaux faibles combinés` : `${count} طلاب يظهرون إشارات ضعيفة مجتمعة`],
  [/^(\d+) students progressing in several dimensions$/, (locale, _match, count) => locale === "fr" ? `${count} élèves progressent dans plusieurs dimensions` : `${count} طلاب يتقدمون في عدة أبعاد`],
];

export function translateText(text: string, locale: Locale) {
  if (locale === "en" || !text.trim()) return text;
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const core = text.trim();
  const exact = phrases[core]?.[locale];
  if (exact) return `${leading}${exact}${trailing}`;
  for (const [pattern, resolve] of replacements) {
    const match = core.match(pattern);
    if (match) {
      const value = resolve(locale, match[0], ...match.slice(1));
      if (value) return `${leading}${value}${trailing}`;
    }
  }
  return text;
}

export function translationCoverageKeys() {
  return Object.keys(phrases);
}

// ---------------------------------------------------------------------------
// Phase 1 — enriched student file (identity, family, medical, rights,
// discipline, learning plans, meetings, daily tracking)
// ---------------------------------------------------------------------------

phrases["Address"] = { fr: "Adresse", ar: "العنوان" };
phrases["AESH — School support staff"] = { fr: "AESH — Accompagnement scolaire", ar: "AESH — الدعم المدرسي" };
phrases["AESH support"] = { fr: "Accompagnement AESH", ar: "دعم AESH" };
phrases["Agenda"] = { fr: "Ordre du jour", ar: "جدول الأعمال" };
phrases["AI-assisted follow-up"] = { fr: "Suivi assisté par IA", ar: "المتابعة بمساعدة الذكاء الاصطناعي" };
phrases["Allergies"] = { fr: "Allergies", ar: "الحساسية" };
phrases["Assigned to"] = { fr: "Attribué à", ar: "مكلف بـ" };
phrases["Aunt / uncle"] = { fr: "Tante / oncle", ar: "عمة / عم" };
phrases["Authorised pickup persons"] = { fr: "Personnes autorisées à récupérer l'élève", ar: "الأشخاص المخولون باستلام الطالب" };
phrases["Babysitter"] = { fr: "Nounou / baby-sitter", ar: "مربية" };
phrases["Birthplace"] = { fr: "Lieu de naissance", ar: "مكان الولادة" };
phrases["Blame / reprimand"] = { fr: "Blâme", ar: "لوم" };
phrases["Blood type"] = { fr: "Groupe sanguin", ar: "فصيلة الدم" };
phrases["Boarding"] = { fr: "Internat", ar: "داخلي" };
phrases["Bus line"] = { fr: "Ligne de bus", ar: "خط الحافلة" };
phrases["Chronic conditions"] = { fr: "Maladies chroniques", ar: "أمراض مزمنة" };
phrases["Class rules"] = { fr: "Respect des règles", ar: "احترام القواعد" };
phrases["Class work"] = { fr: "Travail en classe", ar: "العمل في القسم" };
phrases["Closed"] = { fr: "Clôturé", ar: "مغلق" };
phrases["Commendation"] = { fr: "Félicitation", ar: "تنويه" };
phrases["Consents & authorisations"] = { fr: "Droits & autorisations", ar: "الحقوق والتفويضات" };
phrases["Daily tracking"] = { fr: "Suivi quotidien", ar: "المتابعة اليومية" };
phrases["Data processing"] = { fr: "Traitement des données", ar: "معالجة البيانات" };
phrases["Date"] = { fr: "Date", ar: "التاريخ" };
phrases["Day student"] = { fr: "Externe", ar: "خارجي" };
phrases["Decisions"] = { fr: "Décisions", ar: "القرارات" };
phrases["Denied"] = { fr: "Refusé", ar: "مرفوض" };
phrases["Discipline"] = { fr: "Discipline", ar: "الانضباط" };
phrases["Dropped off by car"] = { fr: "Déposé en voiture", ar: "بالسيارة" };
phrases["Emergency contact"] = { fr: "Contact d'urgence", ar: "اتصال الطوارئ" };
phrases["Emergency medical care"] = { fr: "Soins médicaux d'urgence", ar: "الرعاية الطبية الطارئة" };
phrases["Emergency protocol"] = { fr: "Protocole d'urgence", ar: "بروتوكول الطوارئ" };
phrases["Encouragement"] = { fr: "Encouragement", ar: "تشجيع" };
phrases["Family"] = { fr: "Famille", ar: "العائلة" };
phrases["Father"] = { fr: "Père", ar: "الأب" };
phrases["Field trips & outings"] = { fr: "Sorties scolaires", ar: "الرحلات المدرسية" };
phrases["Follow-up"] = { fr: "Suivi", ar: "المتابعة" };
phrases["Grandparent"] = { fr: "Grand-parent", ar: "جد / جدة" };
phrases["Granted"] = { fr: "Accordé", ar: "ممنوح" };
phrases["Group work"] = { fr: "Travail de groupe", ar: "العمل الجماعي" };
phrases["Guardian"] = { fr: "Tuteur légal", ar: "ولي الأمر" };
phrases["Guardians"] = { fr: "Tuteurs légaux", ar: "أولياء الأمور" };
phrases["Half board"] = { fr: "Demi-pension", ar: "نصف داخلي" };
phrases["Held"] = { fr: "Tenue", ar: "منعقدة" };
phrases["Home language"] = { fr: "Langue de la maison", ar: "لغة المنزل" };
phrases["Honor roll"] = { fr: "Tableau d'honneur", ar: "لوحة الشرف" };
phrases["ID"] = { fr: "Pièce d'identité", ar: "بطاقة التعريف" };
phrases["Identity"] = { fr: "Identité", ar: "الهوية" };
phrases["Identity & schooling"] = { fr: "Identité & scolarité", ar: "الهوية والتمدرس" };
phrases["Languages spoken"] = { fr: "Langues parlées", ar: "اللغات المحكية" };
phrases["Learning plans"] = { fr: "Aménagements", ar: "الترتيبات التربوية" };
phrases["Medical"] = { fr: "Médical", ar: "الطبي" };
phrases["Medications"] = { fr: "Médicaments", ar: "الأدوية" };
phrases["Meetings"] = { fr: "Réunions", ar: "الاجتماعات" };
phrases["Minutes"] = { fr: "Compte-rendu", ar: "محضر الاجتماع" };
phrases["Mother"] = { fr: "Mère", ar: "الأم" };
phrases["Nationality"] = { fr: "Nationalité", ar: "الجنسية" };
phrases["No entries yet"] = { fr: "Aucune entrée pour le moment", ar: "لا توجد أي إدخالات بعد" };
phrases["No exceptions recorded — everything on track"] = { fr: "Aucune exception enregistrée — tout est dans la norme", ar: "لا توجد استثناءات مسجلة — كل شيء على ما يرام" };
phrases["No plans yet"] = { fr: "Aucun aménagement pour le moment", ar: "لا توجد ترتيبات بعد" };
phrases["None"] = { fr: "Aucun", ar: "لا يوجد" };
phrases["Note"] = { fr: "Remarque", ar: "ملاحظة" };
phrases["On foot"] = { fr: "À pied", ar: "سيرًا على الأقدام" };
phrases["Organisation"] = { fr: "Organisation", ar: "التنظيم" };
phrases["Other"] = { fr: "Autre", ar: "أخرى" };
phrases["PAI — Individual accommodation plan"] = { fr: "PAI — Projet d'accueil individualisé", ar: "PAI — خطة الاستقبال الفردية" };
phrases["PAP — Personal support plan"] = { fr: "PAP — Plan d'accompagnement personnalisé", ar: "PAP — خطة الدعم الشخصية" };
phrases["Parent meetings"] = { fr: "Réunions parents", ar: "اجتماعات أولياء الأمور" };
phrases["Participants"] = { fr: "Participants", ar: "المشاركون" };
phrases["Pending"] = { fr: "En attente", ar: "قيد الانتظار" };
phrases["Phone"] = { fr: "Téléphone", ar: "الهاتف" };
phrases["Photo use (image rights)"] = { fr: "Droit à l'image", ar: "حق الصورة" };
phrases["Physician phone"] = { fr: "Téléphone du médecin", ar: "هاتف الطبيب" };
phrases["Previous school"] = { fr: "École précédente", ar: "المدرسة السابقة" };
phrases["Primary contact"] = { fr: "Contact principal", ar: "جهة الاتصال الرئيسية" };
phrases["PPS — Personal schooling plan"] = { fr: "PPS — Projet personnalisé de scolarisation", ar: "PPS — خطة التمدرس الشخصية" };
phrases["Punctuality"] = { fr: "Ponctualité", ar: "الانتظام" };
phrases["Recent daily tracking"] = { fr: "Suivi quotidien récent", ar: "المتابعة اليومية الأخيرة" };
phrases["Recognition & discipline register"] = { fr: "Registre discipline & reconnaissance", ar: "سجل الانضباط والتقدير" };
phrases["Regime"] = { fr: "Régime", ar: "النظام" };
phrases["Relationship"] = { fr: "Lien", ar: "العلاقة" };
phrases["Restricted medical record"] = { fr: "Dossier médical restreint", ar: "ملف طبي مقيد" };
phrases["Rights"] = { fr: "Droits", ar: "الحقوق" };
phrases["School bus"] = { fr: "Bus scolaire", ar: "حافلة مدرسية" };
phrases["Sharing with external parties"] = { fr: "Partage avec des tiers", ar: "المشاركة مع أطراف خارجية" };
phrases["Sibling"] = { fr: "Frère / sœur", ar: "أخ / أخت" };
phrases["Signed"] = { fr: "Signé le", ar: "وقّع في" };
phrases["Sports restrictions"] = { fr: "Restrictions sportives", ar: "قيود الرياضة" };
phrases["Student number"] = { fr: "N° d'élève", ar: "رقم التلميذ" };
phrases["Temporary exclusion"] = { fr: "Exclusion temporaire", ar: "إقصاء مؤقت" };
phrases["Transfer reason"] = { fr: "Motif du transfert", ar: "سبب النقل" };
phrases["Transport"] = { fr: "Transport", ar: "النقل" };
phrases["Treating physician"] = { fr: "Médecin traitant", ar: "الطبيب المعالج" };
phrases["Updated"] = { fr: "Mis à jour", ar: "آخر تحديث" };
phrases["Visible to teachers"] = { fr: "Visible par les enseignants", ar: "مرئي للمعلمين" };
phrases["Visible to the school nurse and administration; teachers only see the emergency protocol."] = { fr: "Visible par l'infirmière et l'administration ; les enseignants ne voient que le protocole d'urgence.", ar: "مرئي للممرضة والإدارة فقط؛ يرى المعلمون بروتوكول الطوارئ وحده." };
phrases["Warning"] = { fr: "Avertissement", ar: "إنذار" };
phrases["Wellbeing tracking"] = { fr: "Suivi du bien-être", ar: "تتبع الرفاهية" };
phrases["By-exception entries: only criteria that deviated from expectations are recorded (1–2 flagged, 5 excellent)."] = { fr: "Saisie par exception : seuls les critères sortant de la norme sont notés (1–2 à surveiller, 5 excellent).", ar: "إدخال بالاستثناء: تُسجل المعايير الخارجة عن المعتاد فقط (1–2 يحتاج متابعة، 5 ممتاز)." };

// ---------------------------------------------------------------------------
// i18n audit fixes — shared components, page translations, breadcrumbs, forms
// ---------------------------------------------------------------------------
Object.assign(phrases, {
  "Signal": { fr: "Signal", ar: "إشارة" },
  "Class": { fr: "Classe", ar: "الفصل" },
  "Overall": { fr: "Global", ar: "الإجمالي" },
  "Recent form": { fr: "Forme récente", ar: "الأداء الأخير" },
  "Attribute profile": { fr: "Profil par attribut", ar: "الملف حسب السمة" },
  "Core": { fr: "Tronc commun", ar: "أساسية" },
  "Description": { fr: "Description", ar: "الوصف" },
  "Grades": { fr: "Notes", ar: "الدرجات" },
  "Visibility": { fr: "Visibilité", ar: "الظهور" },
  "Nurse": { fr: "Infirmière", ar: "ممرضة" },
  "You": { fr: "Vous", ar: "أنت" },
  "Yesterday": { fr: "Hier", ar: "أمس" },
  "Last week": { fr: "Semaine dernière", ar: "الأسبوع الماضي" },
  "Schedule": { fr: "Emploi du temps", ar: "الجدول الزمني" },
  "Attendance entered": { fr: "Appel saisi", ar: "تسجيل الحضور" },
  "My progress": { fr: "Ma progression", ar: "تقدمي" },
  "students": { fr: "élèves", ar: "طالبًا" },
  "present": { fr: "présents", ar: "حاضرون" },
  "attendance": { fr: "présence", ar: "الحضور" },
  "of": { fr: "sur", ar: "من" },
  "submitted": { fr: "rendus", ar: "مسلَّم" },
  "shown": { fr: "affichés", ar: "معروضة" },
  "Gold": { fr: "Or", ar: "ذهبية" },
  "Silver": { fr: "Argent", ar: "فضية" },
  "Bronze": { fr: "Bronze", ar: "برونزية" },
  "Achieved": { fr: "Atteint", ar: "تحقق" },

  // directory-pages.tsx
  "Browse every class, compare key indicators and open the visual student squad.": { fr: "Parcourez chaque classe, comparez les indicateurs clés et ouvrez la vue élève visuelle.", ar: "تصفح كل فصل وقارن المؤشرات الرئيسية وافتح عرض الطالب البصري." },
  "Add class": { fr: "Ajouter une classe", ar: "إضافة فصل" },
  "Create a class": { fr: "Créer une classe", ar: "إنشاء فصل" },
  "Active classes": { fr: "Classes actives", ar: "الفصول النشطة" },
  "Grades 7 to 9": { fr: "Niveaux 7e à 9e", ar: "الصفوف 7 إلى 9" },
  "24.5 average class size": { fr: "Effectif moyen de 24,5", ar: "متوسط حجم الفصل 24.5" },
  "School average today": { fr: "Moyenne de l’école aujourd’hui", ar: "متوسط المدرسة اليوم" },
  "Up over six weeks": { fr: "En hausse sur six semaines", ar: "تحسّن خلال ستة أسابيع" },
  "Search by class, teacher or room": { fr: "Rechercher par classe, enseignant ou salle", ar: "البحث حسب الفصل أو المعلم أو القاعة" },
  "All grades": { fr: "Tous les niveaux", ar: "كل الصفوف" },
  "Open squad": { fr: "Ouvrir la vue classe", ar: "فتح عرض الفصل" },
  "Search the school roster and open a complete Student 360 profile.": { fr: "Recherchez dans l’effectif de l’école et ouvrez un profil Student 360 complet.", ar: "ابحث في سجل المدرسة وافتح ملف Student 360 كاملاً." },
  "Add student": { fr: "Ajouter un élève", ar: "إضافة طالب" },
  "Add a student": { fr: "Ajouter un élève", ar: "إضافة طالب" },
  "First name": { fr: "Prénom", ar: "الاسم الأول" },
  "Last name": { fr: "Nom de famille", ar: "اسم العائلة" },
  "Search by name, class or student number": { fr: "Rechercher par nom, classe ou n° d’élève", ar: "البحث بالاسم أو الفصل أو رقم التلميذ" },
  "Staff directory": { fr: "Annuaire du personnel", ar: "دليل الموظفين" },
  "12 active teaching staff": { fr: "12 enseignants actifs", ar: "12 معلمًا نشطًا" },
  "Search teacher": { fr: "Rechercher un enseignant", ar: "البحث عن معلم" },
  "All active": { fr: "Tous actifs", ar: "الجميع نشط" },
  "Homeroom teachers": { fr: "Professeurs principaux", ar: "معلمو الفصول" },
  "One per class": { fr: "Un par classe", ar: "واحد لكل فصل" },
  "Data completion": { fr: "Saisie des données", ar: "اكتمال البيانات" },
  "Attendance and observations": { fr: "Présence et observations", ar: "الحضور والملاحظات" },
  "Invite teacher": { fr: "Inviter un enseignant", ar: "دعوة معلم" },
  "Invite a teacher": { fr: "Inviter un enseignant", ar: "دعوة معلم" },
  "Email": { fr: "E-mail", ar: "البريد الإلكتروني" },
  "completion": { fr: "complétion", ar: "الاكتمال" },
  "Greenwood International School": { fr: "École internationale Greenwood", ar: "مدرسة غرينوود الدولية" },
  "School overview · Casablanca campus · Academic year 2025–2026": { fr: "Vue d’ensemble de l’école · Campus de Casablanca · Année scolaire 2025–2026", ar: "نظرة عامة على المدرسة · حرم الدار البيضاء · السنة الدراسية 2025–2026" },
  "9 subject areas": { fr: "9 matières", ar: "9 مواد" },
  "Parent engagement": { fr: "Engagement des parents", ar: "مشاركة أولياء الأمور" },
  "Active in last 30 days": { fr: "Actifs sur les 30 derniers jours", ar: "نشط خلال آخر 30 يومًا" },
  "Open support plans": { fr: "Plans d’accompagnement ouverts", ar: "خطط دعم مفتوحة" },
  "3 due for review": { fr: "3 à examiner", ar: "3 بحاجة إلى مراجعة" },
  "Grades and classes": { fr: "Niveaux et classes", ar: "الصفوف والفصول" },
  "Drill down from school to student": { fr: "Descendez de l’école jusqu’à l’élève", ar: "انتقل من المدرسة إلى الطالب" },
  "This week across all classes": { fr: "Cette semaine dans toutes les classes", ar: "هذا الأسبوع في كل الفصول" },
  "Homework updates": { fr: "Devoirs mis à jour", ar: "تحديثات الواجبات" },
  "Teacher observations": { fr: "Observations des enseignants", ar: "ملاحظات المعلمين" },
  "Privacy by design": { fr: "Confidentialité dès la conception", ar: "الخصوصية بالتصميم" },
  "High-level views avoid exposing sensitive individual wellbeing entries.": { fr: "Les vues agrégées évitent d’exposer les saisies individuelles sensibles de bien-être.", ar: "تتجنب العروض العامة كشف الإدخالات الفردية الحساسة للرفاه." },
  "A calm, practical overview of what matters today.": { fr: "Une vue d’ensemble claire et pratique de ce qui compte aujourd’hui.", ar: "نظرة عامة هادئة وعملية لما يهم اليوم." },
  "Present today": { fr: "Présent aujourd’hui", ar: "حاضر اليوم" },
  "Doing well": { fr: "Ça va bien", ar: "حالته جيدة" },
  "View profile": { fr: "Voir le profil", ar: "عرض الملف" },
  "Message teacher": { fr: "Écrire à l’enseignant", ar: "مراسلة المعلم" },
  "Multi-tenant platform health and subscription management.": { fr: "État de santé de la plateforme multi-tenant et gestion des abonnements.", ar: "صحة المنصة متعددة المستأجرين وإدارة الاشتراكات." },
  "Platform-wide user directory and access overview.": { fr: "Annuaire des utilisateurs de la plateforme et vue d’ensemble des accès.", ar: "دليل مستخدمي المنصة ونظرة عامة على الوصول." },
  "Add school": { fr: "Ajouter une école", ar: "إضافة مدرسة" },
  "Add a school tenant": { fr: "Ajouter une école à la plateforme", ar: "إضافة مدرسة إلى المنصة" },
  "Invite user": { fr: "Inviter un utilisateur", ar: "دعوة مستخدم" },
  "Invite a platform user": { fr: "Inviter un utilisateur de la plateforme", ar: "دعوة مستخدم للمنصة" },
  "School name": { fr: "Nom de l’école", ar: "اسم المدرسة" },
  "Country": { fr: "Pays", ar: "البلد" },
  "Plan": { fr: "Formule", ar: "الباقة" },
  "Administrator email": { fr: "E-mail de l’administrateur", ar: "بريد المدير" },
  "Name": { fr: "Nom", ar: "الاسم" },
  "Total users": { fr: "Utilisateurs au total", ar: "إجمالي المستخدمين" },
  "Demo environment": { fr: "Environnement de démonstration", ar: "بيئة تجريبية" },
  "Active this month": { fr: "Actifs ce mois-ci", ar: "نشط هذا الشهر" },
  "Healthy adoption": { fr: "Adoption saine", ar: "تبنٍّ جيد" },
  "Seats used": { fr: "Postes utilisés", ar: "المقاعد المستخدمة" },
  "Pending invites": { fr: "Invitations en attente", ar: "دعوات معلقة" },
  "Within plan limits": { fr: "Dans les limites de la formule", ar: "ضمن حدود الباقة" },
  "Search schools": { fr: "Rechercher des écoles", ar: "البحث عن المدارس" },
  "Search name, email or role": { fr: "Rechercher par nom, e-mail ou rôle", ar: "البحث بالاسم أو البريد أو الدور" },
  "Trial": { fr: "Essai", ar: "تجريبي" },
  "Suspended": { fr: "Suspendu", ar: "موقوف" },
  "Casablanca, Morocco · PRO plan": { fr: "Casablanca, Maroc · Formule PRO", ar: "الدار البيضاء، المغرب · باقة PRO" },
  "Principal · Greenwood International School": { fr: "Direction · École internationale Greenwood", ar: "مدير · مدرسة غرينوود الدولية" },

  // workflow-pages.tsx
  "Tap a class to open its squad view": { fr: "Touchez une classe pour ouvrir sa vue", ar: "اضغط على فصل لفتح عرضه" },
  "Current: Grade 7A": { fr: "En cours : 7e A", ar: "الحالي: الصف السابع أ" },
  "In progress": { fr: "En cours", ar: "قيد التنفيذ" },
  "Next": { fr: "Suivant", ar: "التالي" },
  "Upcoming": { fr: "À venir", ar: "قادم" },
  "Live pulse": { fr: "Dynamique en direct", ar: "مؤشر مباشر" },
  "Latest events from your classes": { fr: "Derniers événements de vos classes", ar: "أحدث الأحداث من فصولك" },
  "View all": { fr: "Tout voir", ar: "عرض الكل" },
  "Classes today": { fr: "Classes aujourd’hui", ar: "الفصول اليوم" },
  "Grade 9B pending": { fr: "9e B en attente", ar: "الصف التاسع ب قيد الانتظار" },
  "Homework to review": { fr: "Devoirs à examiner", ar: "واجبات للمراجعة" },
  "Across 3 assignments": { fr: "Sur 3 devoirs", ar: "عبر 3 واجبات" },
  "Reasons available": { fr: "Raisons disponibles", ar: "الأسباب متاحة" },
  "Assignments, submission progress, feedback and completion patterns.": { fr: "Devoirs, progression des rendus, retours et habitudes de complétion.", ar: "الواجبات وتقدم التسليمات والملاحظات وأنماط الإنجاز." },
  "Create homework assignment": { fr: "Créer un devoir à la maison", ar: "إنشاء واجب منزلي" },
  "Title": { fr: "Titre", ar: "العنوان" },
  "Due date": { fr: "Date d’échéance", ar: "تاريخ الاستحقاق" },
  "Open assignments": { fr: "Devoirs ouverts", ar: "واجبات مفتوحة" },
  "Across 4 classes": { fr: "Sur 4 classes", ar: "عبر 4 فصول" },
  "Due today": { fr: "À rendre aujourd’hui", ar: "يُسلَّم اليوم" },
  "21 / 26 submitted": { fr: "21 / 26 rendus", ar: "21 / 26 سلَّموا" },
  "Completion": { fr: "Complétion", ar: "الإنجاز" },
  "Need feedback": { fr: "À annoter", ar: "بحاجة إلى ملاحظات" },
  "Teacher review queue": { fr: "File d’examen des enseignants", ar: "قائمة مراجعة المعلم" },
  "Search assignments": { fr: "Rechercher des devoirs", ar: "البحث عن الواجبات" },
  "Needs review": { fr: "À examiner", ar: "تحتاج مراجعة" },
  "Close": { fr: "Clôturer", ar: "إغلاق" },
  "Grade 8B · Daily register and attendance patterns.": { fr: "8e B · Appel du jour et tendances de présence.", ar: "الصف الثامن ب · سجل الحضور اليومي وأنماطه." },
  "Family notification available": { fr: "Notification famille disponible", ar: "إشعار العائلة متاح" },
  "Average 8 minutes": { fr: "8 minutes en moyenne", ar: "8 دقائق في المتوسط" },
  "30-day attendance": { fr: "Présence sur 30 jours", ar: "الحضور خلال 30 يومًا" },
  "Grade 8B average": { fr: "Moyenne 8e B", ar: "متوسط الصف الثامن ب" },
  "30 days": { fr: "30 jours", ar: "30 يومًا" },
  "Pattern": { fr: "Tendance", ar: "النمط" },
  "Monitor": { fr: "À surveiller", ar: "مراقبة" },
  "Steady": { fr: "Régulier", ar: "منتظم" },
  "Fast teacher input that automatically feeds the longitudinal student profile.": { fr: "Saisie rapide pour l’enseignant, intégrée automatiquement au profil longitudinal de l’élève.", ar: "إدخال سريع للمعلم يغذي تلقائيًا ملف الطالب الطولي." },
  "New observation": { fr: "Nouvelle observation", ar: "ملاحظة جديدة" },
  "Detailed observation": { fr: "Observation détaillée", ar: "ملاحظة مفصلة" },
  "Across your classes": { fr: "Dans vos classes", ar: "عبر فصولك" },
  "Recognition and strengths": { fr: "Reconnaissances et points forts", ar: "التقدير ونقاط القوة" },
  "Follow-ups due": { fr: "Suivis en attente", ar: "متابعات مستحقة" },
  "Support actions": { fr: "Actions d’accompagnement", ar: "إجراءات دعم" },
  "Search student or note": { fr: "Rechercher un élève ou une note", ar: "البحث عن طالب أو ملاحظة" },
  "Follow-up due": { fr: "Suivi en attente", ar: "متابعة مستحقة" },
  "Participation": { fr: "Participation", ar: "المشاركة" },
  "Effort": { fr: "Effort", ar: "الجهد" },
  "Collaboration": { fr: "Collaboration", ar: "التعاون" },
  "Support needed": { fr: "Aide nécessaire", ar: "يحتاج إلى دعم" },
  "Quizzes, tests and projects with fast grade entry and progress context.": { fr: "Quiz, contrôles et projets avec saisie rapide des notes et contexte de progression.", ar: "اختبارات ومشاريع مع إدخال سريع للدرجات وسياق التقدم." },
  "Class and subject": { fr: "Classe et matière", ar: "الفصل والمادة" },
  "This term": { fr: "Ce trimestre", ar: "هذا الفصل" },
  "Awaiting grades": { fr: "Notes en attente", ar: "درجات معلقة" },
  "Student results": { fr: "Résultats élèves", ar: "نتائج الطلاب" },
  "Academic trend": { fr: "Tendance scolaire", ar: "الاتجاه الأكاديمي" },
  "School average": { fr: "Moyenne de l’école", ar: "متوسط المدرسة" },
  "Search assessments": { fr: "Rechercher des évaluations", ar: "البحث عن التقييمات" },
  "All subjects": { fr: "Toutes les matières", ar: "كل المواد" },
  "Science": { fr: "Sciences", ar: "العلوم" },
  "History": { fr: "Histoire", ar: "التاريخ" },
  "Grades complete": { fr: "Notes complètes", ar: "الدرجات مكتملة" },
  "Grade entry open": { fr: "Saisie des notes ouverte", ar: "إدخال الدرجات مفتوح" },
  "Class average": { fr: "Moyenne de classe", ar: "متوسط الفصل" },
  "Review grades": { fr: "Revoir les notes", ar: "مراجعة الدرجات" },
  "Versus last week": { fr: "vs semaine dernière", ar: "مقارنة بالأسبوع الماضي" },
  "92% this week": { fr: "92 % cette semaine", ar: "92% هذا الأسبوع" },
  "Based on observations": { fr: "Basé sur les observations", ar: "بناءً على الملاحظات" },
  "21 of 26 students": { fr: "21 élèves sur 26", ar: "21 من 26 طالبًا" },
  "Automatic class summary": { fr: "Résumé automatique de la classe", ar: "ملخص الفصل التلقائي" },
  "Grade 8B has maintained stable attendance while homework completion and engagement improved. Six students show clear positive momentum. Four students have one or more signals worth checking in on; each suggestion includes its evidence and requires teacher judgement.": { fr: "La 8e B a maintenu une présence stable tandis que la complétion des devoirs et l’engagement se sont améliorés. Six élèves montrent un élan positif net. Quatre élèves présentent un ou plusieurs signaux à vérifier ; chaque suggestion s’appuie sur des preuves et exige le jugement de l’enseignant.", ar: "حافظ الصف الثامن ب على حضور مستقر بينما تحسّن إنجاز الواجبات والمشاركة. ستة طلاب يظهرون زخمًا إيجابيًا واضحًا. أربعة طلاب لديهم إشارة أو أكثر تستحق المتابعة؛ كل اقتراح يتضمن أدلته ويتطلب حكم المعلم." },
  "Show all": { fr: "Tout afficher", ar: "عرض الكل" },
  "Positive observation": { fr: "Observation positive", ar: "ملاحظة إيجابية" },
  "Attendance update": { fr: "Mise à jour de présence", ar: "تحديث الحضور" },
  "Homework status": { fr: "Statut des devoirs", ar: "حالة الواجبات" },

  // communication-admin-pages.tsx
  "Hello, I wanted to share a quick update about the homework routine this week.": { fr: "Bonjour, je voulais partager une petite mise à jour sur la routine des devoirs cette semaine.", ar: "مرحبًا، أردت مشاركة تحديث سريع حول روتين الواجبات هذا الأسبوع." },
  "Thank you. We noticed the improvement too. The planning checklist seems to be helping.": { fr: "Merci. Nous avons aussi remarqué l’amélioration. La liste de planification semble aider.", ar: "شكرًا. لاحظنا التحسن أيضًا. يبدو أن قائمة التخطيط تساعد." },
  "Weekly report ready": { fr: "Rapport hebdomadaire prêt", ar: "التقرير الأسبوعي جاهز" },
  "PDF and CSV previews": { fr: "Aperçus PDF et CSV", ar: "معاينات PDF وCSV" },
  "One per active class": { fr: "Un par classe active", ar: "واحد لكل فصل نشط" },
  "Student weekly report": { fr: "Rapport hebdomadaire élève", ar: "تقرير الطالب الأسبوعي" },
  "Individual progress, goals, feedback and attendance": { fr: "Progression individuelle, objectifs, retours et présence", ar: "التقدم الفردي والأهداف والملاحظات والحضور" },
  "Student term report": { fr: "Rapport trimestriel élève", ar: "تقرير الفصل الدراسي للطالب" },
  "Full term academic and competency synthesis": { fr: "Synthèse trimestrielle scolaire et par compétences", ar: "توليف أكاديمي وكفاءات للفصل الدراسي" },
  "Class weekly report": { fr: "Rapport hebdomadaire classe", ar: "تقرير الفصل الأسبوعي" },
  "Class indicators, progress groups and highlights": { fr: "Indicateurs de classe, groupes de progression et points forts", ar: "مؤشرات الفصل ومجموعات التقدم والأبرز" },
  "Attendance report": { fr: "Rapport de présence", ar: "تقرير الحضور" },
  "Attendance patterns by grade, class and period": { fr: "Tendances de présence par niveau, classe et période", ar: "أنماط الحضور حسب الصف والفصل والفترة" },
  "Homework report": { fr: "Rapport des devoirs", ar: "تقرير الواجبات" },
  "Completion, lateness and support needs": { fr: "Complétion, retards et besoins d’aide", ar: "الإنجاز والتأخر واحتياجات الدعم" },
  "Intervention report": { fr: "Rapport des accompagnements", ar: "تقرير التدخلات" },
  "Open plans, outcomes and measured progress": { fr: "Plans ouverts, résultats et progrès mesurés", ar: "الخطط المفتوحة والنتائج والتقدم المُقاس" },
  "2025–2026 · 3 terms": { fr: "2025–2026 · 3 trimestres", ar: "2025–2026 · 3 فصول" },
  "6 classes · Grades 7–9": { fr: "6 classes · Niveaux 7e à 9e", ar: "6 فصول · الصفوف 7–9" },
  "9 active subjects": { fr: "9 matières actives", ar: "9 مواد نشطة" },
  "9 core skills": { fr: "9 compétences clés", ar: "9 مهارات أساسية" },
  "4 active types": { fr: "4 types actifs", ar: "4 أنواع نشطة" },
  "5 daily dimensions": { fr: "5 dimensions quotidiennes", ar: "5 أبعاد يومية" },
  "English, French, Arabic": { fr: "Anglais, français, arabe", ar: "الإنجليزية والفرنسية والعربية" },
  "Search actor, action or entity": { fr: "Rechercher un auteur, une action ou une entité", ar: "البحث عن فاعل أو إجراء أو كيان" },
  "All actions": { fr: "Toutes les actions", ar: "كل الإجراءات" },
  "Student access": { fr: "Accès élève", ar: "وصول الطالب" },
  "Data changes": { fr: "Modifications de données", ar: "تغييرات البيانات" },
  "Authentication": { fr: "Authentification", ar: "المصادقة" },
  "Across all authorised roles": { fr: "Tous les rôles autorisés", ar: "عبر كل الأدوار المخولة" },
  "Student profile access": { fr: "Accès aux profils élèves", ar: "الوصول إلى ملفات الطلاب" },
  "All logged with actor and time": { fr: "Tout est journalisé avec auteur et heure", ar: "كل العمليات مسجلة مع الفاعل والوقت" },
  "Opened Adam Benali's profile": { fr: "A ouvert le profil d’Adam Benali", ar: "فتح ملف آدم بنعلي" },
  "Added a positive mathematics observation": { fr: "A ajouté une observation positive de mathématiques", ar: "أضاف ملاحظة رياضيات إيجابية" },
  "Created explainable help-request signal": { fr: "A créé un signal d’aide demandée explicable", ar: "أنشأ إشارة طلب مساعدة قابلة للتفسير" },
  "Submitted French homework": { fr: "A rendu le devoir de français", ar: "سلّم واجب الفرنسية" },
  "Exported attendance report": { fr: "A exporté le rapport de présence", ar: "صدّر تقرير الحضور" },
  "Marked one Grade 8B absence": { fr: "A signalé une absence en 8e B", ar: "سجّل غيابًا واحدًا في الصف الثامن ب" },

  // self-service-pages.tsx
  "Your growth across multiple dimensions. One number never defines you.": { fr: "Votre progression sur plusieurs dimensions. Un seul chiffre ne vous définit jamais.", ar: "نموك عبر أبعاد متعددة. رقم واحد لا يحددك أبدًا." },
  "Six-week form": { fr: "Courbe sur six semaines", ar: "منحنى ستة أسابيع" },
  "Your dimensions move independently": { fr: "Vos dimensions évoluent indépendamment", ar: "أبعادك تتطور بشكل مستقل" },
  "Homework consistency": { fr: "Régularité des devoirs", ar: "انتظام الواجبات" },
  "You are building momentum": { fr: "Vous construisez votre élan", ar: "أنت تبني زخمك" },
  "Homework consistency improved for three weeks": { fr: "La régularité des devoirs s’est améliorée pendant trois semaines", ar: "تحسن انتظام الواجبات لثلاثة أسابيع" },
  "Teachers noticed strong collaboration": { fr: "Les enseignants ont remarqué une forte collaboration", ar: "لاحظ المعلمون تعاونًا قويًا" },
  "Next useful step": { fr: "Prochaine étape utile", ar: "الخطوة المفيدة التالية" },
  "Keep using your planning checklist": { fr: "Continuez à utiliser votre liste de planification", ar: "استمر في استخدام قائمة التخطيط" },
  "Ask for help early when algebra feels unclear": { fr: "Demandez de l’aide tôt quand l’algèbre est floue", ar: "اطلب المساعدة مبكرًا عند صعوبة الجبر" },
  "Small, practical goals owned by students and supported by adults.": { fr: "Des objectifs petits et concrets, portés par les élèves et soutenus par les adultes.", ar: "أهداف صغيرة وعملية يملكها الطلاب ويدعمها الكبار." },
  "Create a goal": { fr: "Créer un objectif", ar: "إنشاء هدف" },
  "What do you want to achieve?": { fr: "Que veux-tu accomplir ?", ar: "ماذا تريد أن تحقق؟" },
  "Target date": { fr: "Date cible", ar: "التاريخ المستهدف" },
  "Helpful actions": { fr: "Actions utiles", ar: "إجراءات مفيدة" },
  "Owner: Student + teacher · Target this week": { fr: "Porté par : élève + enseignant · Objectif de la semaine", ar: "المالك: الطالب + المعلم · الهدف هذا الأسبوع" },
  "Add progress update": { fr: "Ajouter une mise à jour", ar: "إضافة تحديث" },
  "Encouragement, useful next steps and teacher comments in one place.": { fr: "Encouragements, prochaines étapes utiles et commentaires des enseignants en un seul endroit.", ar: "تشجيع وخطوات مفيدة وتعليقات المعلمين في مكان واحد." },
  "Feedback this month": { fr: "Retours ce mois-ci", ar: "الملاحظات هذا الشهر" },
  "From 6 teachers": { fr: "De 6 enseignants", ar: "من 6 معلمين" },
  "Strengths worth recognising": { fr: "Des points forts à reconnaître", ar: "نقاط قوة تستحق التقدير" },
  "Helpful next steps": { fr: "Prochaines étapes utiles", ar: "خطوات تالية مفيدة" },
  "Actionable and supportive": { fr: "Concrètes et bienveillantes", ar: "قابلة للتنفيذ وداعمة" },
  "2 days ago": { fr: "il y a 2 jours", ar: "قبل يومين" },
  "4 days ago": { fr: "il y a 4 jours", ar: "قبل 4 أيام" },
  "Celebrate progress, effort, competencies and meaningful milestones.": { fr: "Célébrez la progression, l’effort, les compétences et les étapes importantes.", ar: "احتفل بالتقدم والجهد والكفاءات والمحطات المهمة." },
  "Awarded this term · Visible to student and family": { fr: "Décerné ce trimestre · Visible par l’élève et la famille", ar: "مُمنح هذا الفصل · مرئي للطالب والأسرة" },
  "Reaching out is a strength. Tell the right adult what would help today.": { fr: "Demander de l’aide est une force. Dites à l’adulte adapté ce qui pourrait aider aujourd’hui.", ar: "طلب المساعدة قوة. أخبر الشخص المناسب بما قد يساعد اليوم." },
  "Your request was sent": { fr: "Votre demande a été envoyée", ar: "تم إرسال طلبك" },
  "A trusted member of staff will review it. If you feel unsafe or need immediate help, speak directly to an adult nearby.": { fr: "Un membre de l’équipe en qui vous avez confiance l’examinera. Si vous ne vous sentez pas en sécurité ou avez besoin d’aide immédiate, parlez directement à un adulte proche.", ar: "سيراجع الطلب عضو موثوق من الموظفين. إذا شعرت بعدم الأمان أو كنت بحاجة لمساعدة فورية، تحدث مباشرة مع شخص بالغ قريب." },
  "Send another request": { fr: "Envoyer une autre demande", ar: "إرسال طلب آخر" },
  "What would help you today?": { fr: "Qu’est-ce qui t’aiderait aujourd’hui ?", ar: "ما الذي قد يساعدك اليوم؟" },
  "Understanding a lesson": { fr: "Comprendre une leçon", ar: "فهم درس" },
  "Homework planning": { fr: "Planifier mes devoirs", ar: "تخطيط الواجبات" },
  "Talking to a teacher": { fr: "Parler à un enseignant", ar: "التحدث مع معلم" },
  "Something with classmates": { fr: "Un problème avec des camarades", ar: "أمر مع زملائي" },
  "Feeling overwhelmed": { fr: "Me sentir dépassé(e)", ar: "الشعور بالإرهاق" },
  "Something else": { fr: "Autre chose", ar: "شيء آخر" },
  "You can explain in your own words…": { fr: "Tu peux expliquer avec tes mots…", ar: "يمكنك الشرح بكلماتك الخاصة…" },
  "Confidential request": { fr: "Demande confidentielle", ar: "طلب سري" },
  "Only the school support team will see the details.": { fr: "Seule l’équipe d’accompagnement de l’école verra les détails.", ar: "فقط فريق دعم المدرسة سيرى التفاصيل." },
  "Send help request": { fr: "Envoyer la demande d’aide", ar: "إرسال طلب المساعدة" },
  "You are in control": { fr: "Vous gardez le contrôle", ar: "أنت تتحكم" },
  "Choose what you want to share": { fr: "Choisissez ce que vous souhaitez partager", ar: "اختر ما تريد مشاركته" },
  "You can ask for a specific adult": { fr: "Vous pouvez demander un adulte précis", ar: "يمكنك طلب شخص معين" },
  "The system never diagnoses or punishes you": { fr: "Le système ne vous diagnostique ni ne vous punit jamais", ar: "النظام لا يشخصك ولا يعاقبك أبدًا" },
  "Recent support": { fr: "Aides récentes", ar: "الدعم الأخير" },
  "Planning support completed": { fr: "Aide à la planification terminée", ar: "اكتملت مساعدة التخطيط" },
  "Your teacher shared a simple homework checklist.": { fr: "Votre enseignant a partagé une simple liste de devoirs.", ar: "شارك معلمك قائمة واجبات بسيطة." },

  // intelligence-pages.tsx
  "Positive events": { fr: "Événements positifs", ar: "أحداث إيجابية" },
  "Event stream": { fr: "Flux d’événements", ar: "تدفق الأحداث" },
  "visible events": { fr: "événements visibles", ar: "أحداث مرئية" },
  "filters update instantly": { fr: "les filtres s’appliquent instantanément", ar: "تحديث فوري للفلاتر" },
  "Auto-refresh simulated": { fr: "Actualisation auto simulée", ar: "تحديث تلقائي محاكى" },
  "No events match this filter.": { fr: "Aucun événement ne correspond à ce filtre.", ar: "لا توجد أحداث تطابق هذا الفلتر." },
  "students show positive momentum": { fr: "élèves montrent un élan positif", ar: "طلاب يظهرون زخمًا إيجابيًا" },
  "Homework completion is": { fr: "La complétion des devoirs est de", ar: "إنجاز الواجبات هو" },
  "One student requested help with algebra": { fr: "Un élève a demandé de l’aide en algèbre", ar: "طلب طالب المساعدة في الجبر" },
  "The request is visible only to authorised staff": { fr: "La demande n’est visible que par le personnel autorisé", ar: "الطلب مرئي فقط للموظفين المصرح لهم" },
  "Colours indicate recent context, not a public student ranking.": { fr: "Les couleurs indiquent le contexte récent, pas un classement public des élèves.", ar: "الألوان تعكس السياق الأخير، وليست ترتيبًا عامًا للطلاب." },
  "Understand trends and weak signals through transparent, evidence-backed explanations.": { fr: "Comprenez les tendances et les signaux faibles grâce à des explications transparentes fondées sur des preuves.", ar: "افهم الاتجاهات والإشارات الضعيفة عبر تفسيرات شفافة مبنية على الأدلة." },
  "Last 6 weeks": { fr: "6 dernières semaines", ar: "آخر 6 أسابيع" },
  "Search a student, class or signal": { fr: "Rechercher un élève, une classe ou un signal", ar: "البحث عن طالب أو فصل أو إشارة" },
  "Completion rate": { fr: "Taux de complétion", ar: "نسبة الإنجاز" },
  "Observation-based": { fr: "Basé sur les observations", ar: "قائم على الملاحظات" },
  "Combined explainable signals": { fr: "Signaux combinés et explicables", ar: "إشارات مركبة قابلة للتفسير" },
  "School trend": { fr: "Tendance de l’école", ar: "اتجاه المدرسة" },
  "Independent dimensions": { fr: "Dimensions indépendantes", ar: "أبعاد مستقلة" },
  "Signal distribution": { fr: "Répartition des signaux", ar: "توزيع الإشارات" },
  "Students are never reduced to one risk score": { fr: "Les élèves ne sont jamais réduits à un seul score de risque", ar: "لا يُختزل الطلاب أبدًا في درجة مخاطرة واحدة" },
  "Why four students?": { fr: "Pourquoi quatre élèves ?", ar: "لماذا أربعة طلاب؟" },
  "3 missing assignments during the last 10 days": { fr: "3 devoirs non rendus sur les 10 derniers jours", ar: "3 واجبات ناقصة خلال آخر 10 أيام" },
  "Motivation decreased in recent check-ins": { fr: "La motivation a baissé dans les bilans récents", ar: "انخفضت الدافعية في التسجيلات الأخيرة" },
  "Two teachers reported reduced participation": { fr: "Deux enseignants ont signalé une participation réduite", ar: "أبلغ معلمان عن تراجع المشاركة" },
  "Explainable attention signals": { fr: "Signaux d’attention explicables", ar: "إشارات انتباه قابلة للتفسير" },
  "Open a student to see evidence and possible actions": { fr: "Ouvrez un élève pour voir les preuves et les actions possibles", ar: "افتح ملف طالب لرؤية الأدلة والإجراءات الممكنة" },
  "Improvement receives equal visibility": { fr: "L’amélioration reçoit une visibilité égale", ar: "يحظى التحسن بنفس القدر من الظهور" },
  "Authorised summaries and suggestions grounded in visible data. Teacher judgement remains essential.": { fr: "Résumés et suggestions autorisés, fondés sur les données visibles. Le jugement de l’enseignant reste essentiel.", ar: "ملخصات واقتراحات مصرح بها مبنية على البيانات الظاهرة. يظل حكم المعلم أساسيًا." },
  "Suggested prompts": { fr: "Questions suggérées", ar: "أسئلة مقترحة" },
  "Try a grounded demo question": { fr: "Essayez une question de démonstration fondée", ar: "جرّب سؤالًا تجريبيًا مبنيًا على البيانات" },
  "Copilot guardrails": { fr: "Garde-fous du copilote", ar: "ضمانات المساعد الذكي" },
  "No medical or psychological diagnosis": { fr: "Aucun diagnostic médical ou psychologique", ar: "لا تشخيص طبي أو نفسي" },
  "No automatic punishment or irreversible decision": { fr: "Aucune sanction automatique ni décision irréversible", ar: "لا عقوبات تلقائية أو قرارات لا رجعة فيها" },
  "Every recommendation must be linked to visible evidence": { fr: "Chaque recommandation doit s’appuyer sur des preuves visibles", ar: "كل توصية يجب أن ترتبط بأدلة ظاهرة" },
  "New conversation": { fr: "Nouvelle conversation", ar: "محادثة جديدة" },
  "Context: Greenwood International School · authorised principal view": { fr: "Contexte : École internationale Greenwood · vue direction autorisée", ar: "السياق: مدرسة غرينوود الدولية · عرض المدير المصرح" },
  "Attendance records": { fr: "Registres de présence", ar: "سجلات الحضور" },
  "Homework submissions": { fr: "Devoirs rendus", ar: "الواجبات المسلَّمة" },
  "Ask about a class, student trend or weekly review…": { fr: "Interrogez sur une classe, une tendance élève ou une revue hebdomadaire…", ar: "اسأل عن فصل أو اتجاه طالب أو مراجعة أسبوعية…" },
  "Hello Nadia. I can summarise visible school data, prepare a weekly review, or explain why a student appears in an attention group. I will always show the evidence behind suggestions.": { fr: "Bonjour Nadia. Je peux résumer les données scolaires visibles, préparer une revue hebdomadaire ou expliquer pourquoi un élève apparaît dans un groupe d’attention. Je montre toujours les preuves derrière mes suggestions.", ar: "مرحبًا نادية. يمكنني تلخيص البيانات المدرسية الظاهرة، أو إعداد مراجعة أسبوعية، أو شرح سبب ظهور طالب في مجموعة انتباه. أعرض دائمًا الأدلة وراء الاقتراحات." },
  "Summarize Grade 8B this week": { fr: "Résumer la 8e B cette semaine", ar: "لخّص الصف الثامن ب هذا الأسبوع" },
  "Grade 8B maintained stable attendance at 92%. Homework completion improved by 8 points and classroom engagement improved by 4 points. Six students show positive momentum. Four students may benefit from a short check-in; the strongest combined evidence is missing homework plus lower self-reported motivation.": { fr: "La 8e B a maintenu une présence stable à 92 %. La complétion des devoirs a gagné 8 points et l’engagement en classe 4 points. Six élèves montrent un élan positif. Quatre élèves pourraient bénéficier d’un court échange ; les preuves combinées les plus fortes sont des devoirs manquants et une motivation autodéclarée en baisse.", ar: "حافظ الصف الثامن ب على حضور مستقر بنسبة 92%. ارتفع إنجاز الواجبات 8 نقاط والمشاركة الصفية 4 نقاط. ستة طلاب يظهرون زخمًا إيجابيًا. أربعة طلاب قد يستفيدون من متابعة قصيرة؛ أقوى الأدلة المجمعة هي الواجبات الناقصة وانخفاض الدافعية الذاتية." },
  "Who should I check in with today?": { fr: "À qui devrais-je parler aujourd’hui ?", ar: "بمن يجب أن أتابع اليوم؟" },
  "Consider checking in with Maya Bennani first because she directly requested help with algebra. Lina Alaoui has a recent attendance change, and Youssef Amrani has repeated incomplete homework. These are suggestions for human review, not automatic classifications.": { fr: "Commencez par Maya Bennani car elle a demandé de l’aide en algèbre. Lina Alaoui a un changement récent de présence et Youssef Amrani accumule des devoirs non rendus. Ce sont des suggestions à examiner humainement, pas des classifications automatiques.", ar: "فكّر في متابعة مايا بناني أولًا لأنها طلبت المساعدة في الجبر مباشرة. لينا علوي لديها تغيير حديث في الحضور، ويوسف عمراني لديه واجبات ناقصة متكررة. هذه اقتراحات للمراجعة البشرية، وليست تصنيفات تلقائية." },
  "Show students who improved": { fr: "Montrer les élèves en progrès", ar: "أظهر الطلاب الذين تحسنوا" },
  "Sara El Idrissi, Adam Benali, Nour El Fassi and Aya Berrada improved across at least two dimensions this month. The strongest improvements are homework consistency, engagement and attendance.": { fr: "Sara El Idrissi, Adam Benali, Nour El Fassi et Aya Berrada se sont améliorés sur au moins deux dimensions ce mois-ci. Les plus fortes progressions concernent la régularité des devoirs, l’engagement et la présence.", ar: "تحسّنت سارة الإدريسي وآدم بنعلي ونور الفاسي وآية برادة في بُعدين على الأقل هذا الشهر. أقوى التحسنات هي انتظام الواجبات والمشاركة والحضور." },
  "Based on the visible demo data, attendance is stable while homework and engagement are improving. I found no basis for a diagnosis or automatic decision. Open the analytics evidence panel to review the underlying observations and check-ins.": { fr: "D’après les données visibles de la démo, la présence est stable tandis que les devoirs et l’engagement s’améliorent. Je n’ai trouvé aucune base pour un diagnostic ou une décision automatique. Ouvrez le panneau de preuves des analyses pour revoir les observations et bilans sous-jacents.", ar: "استنادًا إلى البيانات الظاهرة في العرض، الحضور مستقر بينما تتحسن الواجبات والمشاركة. لم أجد أي أساس لتشخيص أو قرار تلقائي. افتح لوحة الأدلة في التحليلات لمراجعة الملاحظات والتسجيلات الأساسية." },

  // app-shell.tsx — breadcrumb segments & role labels
  "classes": { fr: "Classes", ar: "الفصول" },
  "teachers": { fr: "Enseignants", ar: "المعلمون" },
  "school": { fr: "École", ar: "المدرسة" },
  "today": { fr: "Aujourd’hui", ar: "اليوم" },
  "homework": { fr: "Devoirs", ar: "الواجبات" },
  "observations": { fr: "Observations", ar: "الملاحظات" },
  "assessments": { fr: "Évaluations", ar: "التقييمات" },
  "weekly-review": { fr: "Revue hebdomadaire", ar: "المراجعة الأسبوعية" },
  "live": { fr: "Vue en direct", ar: "العرض المباشر" },
  "analytics": { fr: "Analyses", ar: "التحليلات" },
  "reports": { fr: "Rapports", ar: "التقارير" },
  "messages": { fr: "Messages", ar: "الرسائل" },
  "configuration": { fr: "Configuration", ar: "الإعدادات" },
  "audit-log": { fr: "Journal d’audit", ar: "سجل التدقيق" },
  "copilot": { fr: "Copilote", ar: "المساعد الذكي" },
  "progress": { fr: "Progression", ar: "التقدم" },
  "goals": { fr: "Objectifs", ar: "الأهداف" },
  "feedback": { fr: "Retours", ar: "التغذية الراجعة" },
  "achievements": { fr: "Réussites", ar: "الإنجازات" },
  "help": { fr: "Aide", ar: "المساعدة" },
  "my-children": { fr: "Mes enfants", ar: "أبنائي" },
});

// dashboard-demo.tsx / class-dashboard-demo.tsx — remaining raw strings
Object.assign(phrases, {
  "Create a school action": { fr: "Créer une action d’école", ar: "إنشاء إجراء مدرسي" },
  "138 present · 5 late": { fr: "138 présents · 5 retards", ar: "138 حاضر · 5 متأخر" },
  "Average engagement": { fr: "Engagement moyen", ar: "متوسط المشاركة" },
  "pts": { fr: "pts", ar: "نقطة" },
  "None": { fr: "Aucun", ar: "لا شيء" },
  "Lower": { fr: "En baisse", ar: "أقل" },
  "19 students improved in several dimensions": { fr: "19 élèves ont progressé sur plusieurs dimensions", ar: "19 طالبًا تحسّنوا في عدة أبعاد" },
  "Homework completion +6 points": { fr: "Complétion des devoirs +6 points", ar: "إنجاز الواجبات +6 نقاط" },
  "Review three intervention plans": { fr: "Revoir trois plans d’intervention", ar: "مراجعة ثلاث خطط تدخل" },
  "Prepare Grade 8B weekly review": { fr: "Préparer la revue hebdomadaire de la 8e B", ar: "تحضير المراجعة الأسبوعية للصف الثامن ب" },
  "Reply to two parent messages": { fr: "Répondre à deux messages de parents", ar: "الرد على رسالتين من الأولياء" },
  "Linear equations practice": { fr: "Pratique des équations linéaires", ar: "تمرين على المعادلات الخطية" },
  "Reading reflection — Chapter 4": { fr: "Réflexion de lecture — Chapitre 4", ar: "تأمل القراءة — الفصل 4" },
  "Ecosystem observation sheet": { fr: "Fiche d’observation d’écosystème", ar: "ورقة ملاحظة النظام البيئي" },
  "Industrial revolution timeline": { fr: "Chronologie de la révolution industrielle", ar: "خط زمني للثورة الصناعية" },
  "Opinion paragraph": { fr: "Paragraphe d’opinion", ar: "فقرة رأي" },
  "Today, 17:00": { fr: "Aujourd’hui, 17:00", ar: "اليوم، 17:00" },
  "30 Jul": { fr: "30 juil.", ar: "30 يوليو" },
  "1 Aug": { fr: "1er août", ar: "1 أغسطس" },
  "Engagement high": { fr: "Engagement élevé", ar: "مشاركة عالية" },
  "Participation +1": { fr: "Participation +1", ar: "مشاركة +1" },
  "2 absences": { fr: "2 absences", ar: "غيابان" },
  "Check-ins received": { fr: "Pointages reçus", ar: "تسجيلات الدخول المستلمة" },
  "81% participation": { fr: "81 % de participation", ar: "مشاركة بنسبة 81%" },
  "6 students improved in several dimensions": { fr: "6 élèves ont progressé sur plusieurs dimensions", ar: "6 طلاب تحسّنوا في عدة أبعاد" },
  "Homework completion +8 points": { fr: "Complétion des devoirs +8 points", ar: "إنجاز الواجبات +8 نقاط" },
  "4 students show combined weak signals": { fr: "4 élèves montrent des signaux faibles combinés", ar: "4 طلاب يظهرون إشارات ضعف مجتمعة" },
  "Reasons are available in each profile": { fr: "Les raisons sont disponibles dans chaque profil", ar: "الأسباب متاحة في كل ملف" },
  "Sensitive wellbeing entries are visible only to authorised roles.": { fr: "Les entrées sensibles de bien-être ne sont visibles que par les rôles autorisés.", ar: "الإدخالات الحساسة للرفاهية مرئية فقط للأدوار المصرح بها." },
});

// coverage sweep round 2 — remaining missing keys across all pages
Object.assign(phrases, {
  "6 active classes": { fr: "6 classes actives", ar: "6 فصول نشطة" },
  "76 students": { fr: "76 élèves", ar: "76 طالبًا" },
  "Across all classes": { fr: "Toutes les classes", ar: "جميع الفصول" },
  "Address": { fr: "Adresse", ar: "العنوان" },
  "AESH support": { fr: "Soutien AESH", ar: "دعم مساعد الطالب" },
  "Agenda": { fr: "Ordre du jour", ar: "جدول الأعمال" },
  "Allergies": { fr: "Allergies", ar: "الحساسية" },
  "Ask for help": { fr: "Demander de l’aide", ar: "طلب المساعدة" },
  "Assigned to": { fr: "Assigné à", ar: "مُسند إلى" },
  "Birthplace": { fr: "Lieu de naissance", ar: "مكان الولادة" },
  "Blood type": { fr: "Groupe sanguin", ar: "فصيلة الدم" },
  "Bus line": { fr: "Ligne de bus", ar: "خط الحافلة" },
  "Chronic conditions": { fr: "Maladies chroniques", ar: "الأمراض المزمنة" },
  "Closed": { fr: "Clôturé", ar: "مغلق" },
  "Completion this week": { fr: "Complétion cette semaine", ar: "الإنجاز هذا الأسبوع" },
  "Date": { fr: "Date", ar: "التاريخ" },
  "Decisions": { fr: "Décisions", ar: "القرارات" },
  "Emergency contact": { fr: "Contact d’urgence", ar: "جهة اتصال طارئة" },
  "Emergency protocol": { fr: "Protocole d’urgence", ar: "بروتوكول الطوارئ" },
  "Follow-up": { fr: "Suivi", ar: "المتابعة" },
  "Home language": { fr: "Langue parlée à la maison", ar: "لغة المنزل" },
  "ID": { fr: "Identifiant", ar: "المعرف" },
  "Languages spoken": { fr: "Langues parlées", ar: "اللغات المتحدثة" },
  "Medications": { fr: "Médicaments", ar: "الأدوية" },
  "Minutes": { fr: "Compte rendu", ar: "محضر الاجتماع" },
  "My children": { fr: "Mes enfants", ar: "أبنائي" },
  "Nationality": { fr: "Nationalité", ar: "الجنسية" },
  "New contact": { fr: "Nouveau contact", ar: "جهة اتصال جديدة" },
  "No entries yet": { fr: "Aucune entrée pour l’instant", ar: "لا توجد إدخالات بعد" },
  "No exceptions recorded — everything on track": { fr: "Aucune exception enregistrée — tout est sur la bonne voie", ar: "لا توجد استثناءات مسجلة — كل شيء على المسار الصحيح" },
  "No note": { fr: "Aucune note", ar: "لا ملاحظة" },
  "No plans yet": { fr: "Aucun plan pour l’instant", ar: "لا توجد خطط بعد" },
  "No students in this class.": { fr: "Aucun élève dans cette classe.", ar: "لا يوجد طلاب في هذا الفصل." },
  "Note": { fr: "Note", ar: "ملاحظة" },
  "Now": { fr: "Maintenant", ar: "الآن" },
  "Participants": { fr: "Participants", ar: "المشاركون" },
  "Physician phone": { fr: "Téléphone du médecin", ar: "هاتف الطبيب" },
  "Previous school": { fr: "École précédente", ar: "المدرسة السابقة" },
  "Primary contact": { fr: "Contact principal", ar: "جهة الاتصال الأساسية" },
  "Quick student observation": { fr: "Observation rapide d’un élève", ar: "ملاحظة سريعة لطالب" },
  "Regime": { fr: "Régime", ar: "النظام الغذائي" },
  "Relationship": { fr: "Lien", ar: "صلة القرابة" },
  "Restricted medical record": { fr: "Dossier médical restreint", ar: "ملف طبي مقيد" },
  "Saved values captured from the form on": { fr: "Valeurs capturées du formulaire à", ar: "القيم الملتقطة من النموذج في" },
  "Signed": { fr: "Signé", ar: "موقّع" },
  "Sports restrictions": { fr: "Restrictions sportives", ar: "قيود رياضية" },
  "Staff": { fr: "Personnel", ar: "الموظفون" },
  "Staff directory, class assignments and activity completion.": { fr: "Annuaire du personnel, affectations de classe et suivi des activités.", ar: "دليل الموظفين وتوزيعات الفصول وإنجاز الأنشطة." },
  "Student number": { fr: "Numéro d’élève", ar: "رقم الطالب" },
  "Student, class and school": { fr: "Élève, classe et école", ar: "الطالب والفصل والمدرسة" },
  "Tomorrow": { fr: "Demain", ar: "غدًا" },
  "Transfer reason": { fr: "Motif du transfert", ar: "سبب التحويل" },
  "You don't have permission to view this page.": { fr: "Vous n'avez pas la permission de consulter cette page.", ar: "ليس لديك صلاحية لعرض هذه الصفحة." },
  "If you believe this is a mistake, please contact your school administrator.": { fr: "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur de votre école.", ar: "إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مسؤول مدرستك." },
  "Transport": { fr: "Transport", ar: "النقل" },
  "Treating physician": { fr: "Médecin traitant", ar: "الطبيب المعالج" },
  "Updated": { fr: "Mis à jour", ar: "تم التحديث" },
  "Visible to teachers": { fr: "Visible par les enseignants", ar: "مرئي للمعلمين" },
  "Visible to the school nurse and administration; teachers only see the emergency protocol.": { fr: "Visible par l’infirmière scolaire et l’administration ; les enseignants ne voient que le protocole d’urgence.", ar: "مرئي لممرضة المدرسة والإدارة؛ يرى المعلمون بروتوكول الطوارئ فقط." },
});

// platform-directory-ui.tsx — multi-tenant users & schools directories
Object.assign(phrases, {
  "Parent / Guardian": { fr: "Parent / tuteur", ar: "ولي الأمر" },
  "School nurse": { fr: "Infirmière scolaire", ar: "ممرضة المدرسة" },
  "School administration": { fr: "Administration scolaire", ar: "إدارة المدرسة" },
  "School management": { fr: "Direction de l’école", ar: "إدارة المدرسة العليا" },
  "Platform administrator": { fr: "Administrateur de la plateforme", ar: "مدير المنصة" },
  "Inactive": { fr: "Inactif", ar: "غير نشط" },
  "Archived": { fr: "Archivée", ar: "مؤرشفة" },
  "Last login": { fr: "Dernière connexion", ar: "آخر تسجيل دخول" },
  "City": { fr: "Ville", ar: "المدينة" },
  "All accounts on the platform": { fr: "Tous les comptes de la plateforme", ar: "جميع حسابات المنصة" },
  "Signed in within the last 30 days": { fr: "Connectés au cours des 30 derniers jours", ar: "سجّلوا الدخول خلال آخر 30 يومًا" },
  "Tenants on the platform": { fr: "Établissements sur la plateforme", ar: "المؤسسات على المنصة" },
  "Active student accounts": { fr: "Comptes élèves actifs", ar: "حسابات الطلاب النشطة" },
  "Active schools": { fr: "Écoles actives", ar: "المدارس النشطة" },
  "No users match your search": { fr: "Aucun utilisateur ne correspond à votre recherche", ar: "لا يوجد مستخدمون يطابقون بحثك" },
  "No schools match your search": { fr: "Aucune école ne correspond à votre recherche", ar: "لا توجد مدارس تطابق بحثك" },
});

// audit-ui.tsx — DB-backed audit trail
Object.assign(phrases, {
  "Append-only trail. Records cannot be edited or deleted.": { fr: "Journal en écriture seule. Les enregistrements ne peuvent être ni modifiés ni supprimés.", ar: "سجل للكتابة فقط. لا يمكن تعديل السجلات أو حذفها." },
  "Recorded across the visible scope": { fr: "Enregistrés dans le périmètre visible", ar: "مسجلة ضمن النطاق المرئي" },
  "Logins today": { fr: "Connexions aujourd'hui", ar: "عمليات تسجيل الدخول اليوم" },
  "Authentication events": { fr: "Événements d'authentification", ar: "أحداث المصادقة" },
  "Messages today": { fr: "Messages aujourd'hui", ar: "الرسائل اليوم" },
  "Sent and logged with actor": { fr: "Envoyés et tracés avec leur auteur", ar: "أُرسلت وسُجلت مع الفاعل" },
  "Active sessions": { fr: "Sessions actives", ar: "الجلسات النشطة" },
  "Current valid sessions": { fr: "Sessions en cours de validité", ar: "الجلسات الصالحة حاليًا" },
  "Communication": { fr: "Communication", ar: "التواصل" },
  "Signed in": { fr: "Connexion réussie", ar: "تسجيل دخول" },
  "Signed out": { fr: "Déconnexion", ar: "تسجيل خروج" },
  "Sent a message": { fr: "A envoyé un message", ar: "أرسل رسالة" },
  "Started a conversation": { fr: "A démarré une conversation", ar: "بدأ محادثة" },
  "No audit events match your search": { fr: "Aucun événement d'audit ne correspond à votre recherche", ar: "لا توجد أحداث تدقيق تطابق بحثك" },
  "IP address": { fr: "Adresse IP", ar: "عنوان IP" },
});

// copilot-ui.tsx + copilot/service.ts — DB-grounded assistant
Object.assign(phrases, {
  "Try a grounded question": { fr: "Essayez une question fondée sur les données", ar: "جرّب سؤالًا مبنيًا على البيانات" },
  "Context: {scope}": { fr: "Contexte : {scope}", ar: "السياق: {scope}" },
  "Entire platform": { fr: "Toute la plateforme", ar: "المنصة بأكملها" },
  "Your visible students": { fr: "Vos élèves visibles", ar: "طلابك المرئيون" },
  "Your school": { fr: "Votre école", ar: "مدرستك" },
  "Deterministic answers": { fr: "Réponses déterministes", ar: "إجابات حتمية" },
  "Summarize this week": { fr: "Résumer cette semaine", ar: "لخّص هذا الأسبوع" },
  "Students needing homework support": { fr: "Élèves ayant besoin d'aide pour les devoirs", ar: "الطلاب المحتاجون لدعم في الواجبات" },
  "How is attendance this week?": { fr: "Comment est la présence cette semaine ?", ar: "كيف هو الحضور هذا الأسبوع؟" },
  "Alert history": { fr: "Historique des alertes", ar: "سجل التنبيهات" },
  "Activity events": { fr: "Événements d'activité", ar: "أحداث النشاط" },
  "New enrollments": { fr: "Nouvelles inscriptions", ar: "تسجيلات جديدة" },
  "Weekly indicators": { fr: "Indicateurs hebdomadaires", ar: "مؤشرات أسبوعية" },
  "Competency snapshots": { fr: "Captures de compétences", ar: "لقطات الكفايات" },
  "Hello {name}. I can summarise visible school data, prepare a weekly review, or explain why a student appears in an attention group. I will always show the evidence behind suggestions.": { fr: "Bonjour {name}. Je peux résumer les données scolaires visibles, préparer une revue hebdomadaire ou expliquer pourquoi un élève apparaît dans un groupe d'attention. Je montre toujours les preuves derrière mes suggestions.", ar: "مرحبًا {name}. يمكنني تلخيص البيانات المدرسية الظاهرة، أو إعداد مراجعة أسبوعية، أو شرح سبب ظهور طالب في مجموعة انتباه. أعرض دائمًا الأدلة وراء الاقتراحات." },
  "I can only answer grounded questions about the visible data. Try one of the suggested prompts.": { fr: "Je ne peux répondre qu'à des questions fondées sur les données visibles. Essayez l'une des questions suggérées.", ar: "يمكنني الإجابة فقط عن الأسئلة المبنية على البيانات الظاهرة. جرّب أحد الأسئلة المقترحة." },
  "{n} students have open signals that may deserve a short check-in. Review the evidence on their profiles before acting.": { fr: "{n} élèves ont des signaux ouverts qui pourraient mériter un court échange. Examinez les preuves sur leurs profils avant d'agir.", ar: "{n} طلاب لديهم إشارات مفتوحة قد تستحق متابعة قصيرة. راجع الأدلة على ملفاتهم قبل التصرف." },
  "No open alerts today. Nothing requires immediate attention.": { fr: "Aucune alerte ouverte aujourd'hui. Rien ne requiert une attention immédiate.", ar: "لا تنبيهات مفتوحة اليوم. لا شيء يتطلب اهتمامًا فوريًا." },
  "This week recorded {events} activity events, {logins} sign-ins and {students} new students. The most frequent event type was {top}.": { fr: "Cette semaine a enregistré {events} événements d'activité, {logins} connexions et {students} nouveaux élèves. Le type d'événement le plus fréquent était {top}.", ar: "سُجل هذا الأسبوع {events} حدث نشاط، و{logins} عمليات دخول، و{students} طالب جديد. النوع الأكثر تكرارًا كان {top}." },
  "This week recorded {logins} sign-ins and {students} new students, and no activity events yet.": { fr: "Cette semaine a enregistré {logins} connexions et {students} nouveaux élèves, et pas encore d'événements d'activité.", ar: "سُجل هذا الأسبوع {logins} عمليات دخول و{students} طالب جديد، ولا أحداث نشاط بعد." },
  "{n} students show upward progress in the latest weekly snapshot.": { fr: "{n} élèves montrent une progression positive dans la dernière capture hebdomadaire.", ar: "{n} طلاب يظهرون تقدمًا تصاعديًا في آخر لقطة أسبوعية." },
  "No students show a clear upward trend in the latest weekly snapshot.": { fr: "Aucun élève ne montre de tendance ascendante claire dans la dernière capture hebdomadaire.", ar: "لا يظهر أي طالب اتجاهًا تصاعديًا واضحًا في آخر لقطة أسبوعية." },
  "{n} students currently need homework support or are missing submissions.": { fr: "{n} élèves ont actuellement besoin d'aide pour les devoirs ou ont des rendus manquants.", ar: "{n} طلاب يحتاجون حاليًا إلى دعم في الواجبات أو لديهم تسليمات ناقصة." },
  "No students currently need homework support.": { fr: "Aucun élève n'a actuellement besoin d'aide pour les devoirs.", ar: "لا يحتاج أي طالب حاليًا إلى دعم في الواجبات." },
  "This week attendance across visible students shows {present} present, {late} late and {absent} absent.": { fr: "Cette semaine, la présence parmi les élèves visibles indique {present} présents, {late} en retard et {absent} absents.", ar: "الحضور هذا الأسبوع بين الطلاب المرئيين يُظهر {present} حاضرًا، و{late} متأخرًا، و{absent} غائبًا." },
  "Daily check-in": { fr: "Bilan quotidien", ar: "التسجيل اليومي" },
  "Homework assigned": { fr: "Devoir assigné", ar: "واجب مُسند" },
  "Teacher observation": { fr: "Observation de l'enseignant", ar: "ملاحظة المعلم" },
  "Assessment": { fr: "Évaluation", ar: "تقييم" },
  "Family input": { fr: "Apport de la famille", ar: "مساهمة الأسرة" },
  "Support request": { fr: "Demande de soutien", ar: "طلب دعم" },
  "Goal": { fr: "Objectif", ar: "هدف" },
  "Achievement": { fr: "Réussite", ar: "إنجاز" },
});

// Phase 3 — workflow pages (Today / Homework / Attendance / Observations /
// Assessments / Weekly Review)
phrases["Your schedule, class pulse and priority actions."] = { fr: "Votre emploi du temps, le pouls des classes et les actions prioritaires.", ar: "جدولك اليومي، نبض الصفوف، والإجراءات ذات الأولوية." };
phrases["Across your assignments"] = { fr: "Sur vos séances", ar: "على حصصك" };
phrases["Some classes still pending"] = { fr: "Certaines classes restent à saisir", ar: "بعض الصفوف ما زالت قيد الإدخال" };
phrases["All classes entered"] = { fr: "Toutes les classes sont saisies", ar: "تم إدخال كل الصفوف" };
phrases["Submissions awaiting feedback"] = { fr: "Rendus en attente de retour", ar: "تسليمات بانتظار الملاحظات" };
phrases["Attention or watch signals"] = { fr: "Signaux d'attention ou de vigilance", ar: "إشارات انتباه أو متابعة" };
phrases["Today's timetable"] = { fr: "Emploi du temps du jour", ar: "جدول اليوم" };
phrases["Class in progress"] = { fr: "Cours en cours", ar: "حصة جارية الآن" };
phrases["No classes scheduled today."] = { fr: "Aucun cours prévu aujourd'hui.", ar: "لا توجد حصص مجدولة اليوم." };
phrases["Latest school events"] = { fr: "Derniers événements de l'école", ar: "أحدث أحداث المدرسة" };
phrases["No recent events."] = { fr: "Aucun événement récent.", ar: "لا توجد أحداث حديثة." };
phrases["My day"] = { fr: "Ma journée", ar: "يومي" };
phrases["Check-in today"] = { fr: "Bilan du jour", ar: "الحساب اليومي" };
phrases["Not submitted yet"] = { fr: "Non soumis pour le moment", ar: "لم يُقدَّم بعد" };
phrases["Homework due"] = { fr: "Devoirs à rendre", ar: "واجبات مستحقة" };
phrases["Across visible classes"] = { fr: "Sur les classes visibles", ar: "عبر الصفوف الظاهرة" };
phrases["Items due"] = { fr: "Échéances du jour", ar: "مستحقة اليوم" };
phrases["Review queue"] = { fr: "File de relecture", ar: "قائمة المراجعة" };
phrases["All submissions reviewed"] = { fr: "Tous les rendus sont relus", ar: "تمت مراجعة كل التسليمات" };
phrases["No assignments match your search."] = { fr: "Aucun devoir ne correspond à votre recherche.", ar: "لا توجد واجبات تطابق بحثك." };
phrases["Assignments, submission progress and completion patterns."] = { fr: "Devoirs, avancement des rendus et tendances de complétion.", ar: "الواجبات وتقدم التسليم وأنماط الإنجاز." };
phrases["Overdue"] = { fr: "En retard", ar: "متأخر" };
phrases["Daily register and attendance patterns."] = { fr: "Registre quotidien et tendances de présence.", ar: "السجل اليومي وأنماط الحضور." };
phrases["Visible students"] = { fr: "Élèves visibles", ar: "الطلبة الظاهرون" };
phrases["Not recorded"] = { fr: "Non enregistré", ar: "غير مسجل" };
phrases["Teacher input that feeds the longitudinal student profile."] = { fr: "Les apports des enseignants qui nourrissent le profil longitudinal de l'élève.", ar: "مدخلات المعلمين التي تغذي الملف الطولي للطالب." };
phrases["Across visible students"] = { fr: "Sur les élèves visibles", ar: "عبر الطلبة الظاهرين" };
phrases["Attention signals"] = { fr: "Signaux d'attention", ar: "إشارات انتباه" };
phrases["No observations match your search."] = { fr: "Aucune observation ne correspond à votre recherche.", ar: "لا توجد ملاحظات تطابق بحثك." };
phrases["Quizzes, tests and projects with progress context."] = { fr: "Quiz, tests et projets avec contexte de progression.", ar: "اختبارات وامتحانات ومشاريع مع سياق التقدم." };
phrases["Assessments without results"] = { fr: "Évaluations sans résultats", ar: "تقييمات بدون نتائج" };
phrases["Recent vs previous"] = { fr: "Récents vs précédents", ar: "الأخيرة مقابل السابقة" };
phrases["No assessments match your search."] = { fr: "Aucune évaluation ne correspond à votre recherche.", ar: "لا توجد تقييمات تطابق بحثك." };
phrases["Participation this week"] = { fr: "Participation cette semaine", ar: "المشاركة هذا الأسبوع" };
phrases["{positive} student(s) progressing, {stable} stable, {watch} worth a check-in."] = { fr: "{positive} élève(s) en progression, {stable} stables, {watch} à surveiller.", ar: "{positive} طالب(ة) في تقدم، {stable} مستقرون، {watch} بحاجة إلى متابعة." };
phrases["{count} attention signal(s) are open; each suggestion links to visible evidence."] = { fr: "{count} signal(s) d'attention ouverts ; chaque suggestion renvoie à des preuves visibles.", ar: "{count} إشارة انتباه مفتوحة؛ كل اقتراح يربط بأدلة مرئية." };
phrases["Respond to support signals"] = { fr: "Répondre aux signaux de soutien", ar: "الرد على إشارات الدعم" };
phrases["Review homework submissions"] = { fr: "Relire les rendus de devoirs", ar: "مراجعة تسليمات الواجبات" };
phrases["Complete attendance for the remaining classes"] = { fr: "Compléter la présence pour les classes restantes", ar: "استكمال الحضور للصفوف المتبقية" };
phrases["Check-in participation"] = { fr: "Participation aux bilans", ar: "المشاركة في الحسابات اليومية" };
phrases["All indicators stable compared with the previous period"] = { fr: "Tous les indicateurs sont stables par rapport à la période précédente", ar: "كل المؤشرات مستقرة مقارنة بالفترة السابقة" };
phrases["Keep an eye"] = { fr: "À surveiller", ar: "بحاجة إلى متابعة" };

// Phase 3b — self-service pages (Progress / Goals / Feedback / Achievements / Help)
phrases["Aggregate growth across the students you can see."] = { fr: "Progression globale des élèves que vous pouvez voir.", ar: "النمو الإجمالي للطلاب الذين يمكنك رؤيتهم." };
phrases["Ask for help early when something feels unclear"] = { fr: "Demandez de l'aide tôt quand quelque chose n'est pas clair", ar: "اطلب المساعدة مبكرًا عندما يكون شيء غير واضح" };
phrases["No students in view."] = { fr: "Aucun élève à afficher.", ar: "لا يوجد طلاب للعرض." };
phrases["Active goals"] = { fr: "Objectifs actifs", ar: "الأهداف النشطة" };
phrases["Average progress"] = { fr: "Progression moyenne", ar: "متوسط التقدم" };
phrases["Across visible goals"] = { fr: "Sur les objectifs visibles", ar: "عبر الأهداف الظاهرة" };
phrases["Paused"] = { fr: "En pause", ar: "متوقف مؤقتًا" };
phrases["Cancelled"] = { fr: "Annulé", ar: "ملغى" };
phrases["Not reached"] = { fr: "Non atteint", ar: "لم يتحقق" };
phrases["Target"] = { fr: "Cible", ar: "الهدف" };
phrases["No goals match your search."] = { fr: "Aucun objectif ne correspond à votre recherche.", ar: "لا توجد أهداف تطابق بحثك." };
phrases["From teachers"] = { fr: "Par les enseignants", ar: "من المعلمين" };
phrases["No feedback matches your search."] = { fr: "Aucun retour ne correspond à votre recherche.", ar: "لا توجد ملاحظات تطابق بحثك." };
phrases["Awarded this term"] = { fr: "Attribué ce trimestre", ar: "مُنح هذا الفصل" };
phrases["Outstanding recognition"] = { fr: "Reconnaissance exceptionnelle", ar: "تقدير متميز" };
phrases["Strong and consistent"] = { fr: "Fort et régulier", ar: "قوي ومستمر" };
phrases["Early milestones"] = { fr: "Premières étapes franchies", ar: "محطات مبكرة" };
phrases["Awarded"] = { fr: "Attribué", ar: "مُنح" };
phrases["No achievements yet — effort and milestones will appear here."] = { fr: "Aucune réussite pour le moment — les efforts et les étapes apparaîtront ici.", ar: "لا توجد إنجازات بعد — ستظهر الجهود والمحطات هنا." };
phrases["Something went wrong. Please try again."] = { fr: "Une erreur est survenue. Veuillez réessayer.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى." };
phrases["Sending"] = { fr: "Envoi…", ar: "جارٍ الإرسال…" };
phrases["Send request"] = { fr: "Envoyer la demande", ar: "إرسال الطلب" };
phrases["Recent help requests"] = { fr: "Demandes d'aide récentes", ar: "طلبات المساعدة الأخيرة" };
phrases["this week"] = { fr: "cette semaine", ar: "هذا الأسبوع" };
phrases["No help requests yet."] = { fr: "Aucune demande d'aide pour le moment.", ar: "لا توجد طلبات مساعدة بعد." };
phrases["Student requested assistance"] = { fr: "L'élève a demandé de l'aide", ar: "طلب الطالب المساعدة" };

// Phase 3c — intelligence pages (Analytics / Live)
phrases["Last 7 days"] = { fr: "7 derniers jours", ar: "آخر 7 أيام" };
phrases["Evidence-backed"] = { fr: "Fondé sur des preuves", ar: "قائم على الأدلة" };
phrases["Weekly snapshots"] = { fr: "Instantanés hebdomadaires", ar: "لقطات أسبوعية" };
phrases["in view"] = { fr: "à l'écran", ar: "معروض" };
phrases["Events last 7 days"] = { fr: "Événements (7 jours)", ar: "الأحداث (7 أيام)" };
phrases["Check-ins this week"] = { fr: "Bilans cette semaine", ar: "تسجيلات هذا الأسبوع" };
phrases["Help requests"] = { fr: "Demandes d'aide", ar: "طلبات المساعدة" };
phrases["events with positive sentiment"] = { fr: "événements au sentiment positif", ar: "أحداث بمشاعر إيجابية" };
phrases["help requests this week"] = { fr: "demandes d'aide cette semaine", ar: "طلبات مساعدة هذا الأسبوع" };
phrases["No attention signals in view."] = { fr: "Aucun signal d'attention à l'écran.", ar: "لا توجد إشارات انتباه معروضة." };
phrases["No positive signals in view."] = { fr: "Aucun signal positif à l'écran.", ar: "لا توجد إشارات إيجابية معروضة." };
phrases["Teacher attention notes"] = { fr: "Notes d'attention des enseignants", ar: "ملاحظات انتباه المعلمين" };
phrases["Missing homework"] = { fr: "Devoirs manquants", ar: "واجبات ناقصة" };
phrases["Low attendance"] = { fr: "Présence faible", ar: "حضور منخفض" };
phrases["Missing assignments"] = { fr: "Devoirs manquants", ar: "مهام ناقصة" };
phrases["in 10 days"] = { fr: "en 10 jours", ar: "خلال 10 أيام" };
phrases["in 14 days"] = { fr: "en 14 jours", ar: "خلال 14 يومًا" };
phrases["since"] = { fr: "depuis", ar: "منذ" };
phrases["weeks"] = { fr: "semaines", ar: "أسابيع" };
phrases["Last"] = { fr: "Dernières", ar: "آخر" };
phrases["Why these students?"] = { fr: "Pourquoi ces élèves ?", ar: "لماذا هؤلاء الطلاب؟" };
phrases["A privacy-conscious pulse of attendance, check-ins and learning events."] = { fr: "Une vue respectueuse de la confidentialité sur la présence, les bilans et les événements pédagogiques.", ar: "مؤشر يراعي الخصوصية للحضور والتسجيلات والأحداث التعليمية." };
phrases["Live"] = { fr: "En direct", ar: "مباشر" };
phrases["classes"] = { fr: "classes", ar: "فصول" };
phrases["Check-in"] = { fr: "Bilan", ar: "تسجيل" };
phrases["Observation"] = { fr: "Observation", ar: "ملاحظة" };
phrases["Homework submitted"] = { fr: "Devoir rendu", ar: "واجب مُسلَّم" };
phrases["Grade published"] = { fr: "Note publiée", ar: "درجة منشورة" };
phrases["Help requested"] = { fr: "Aide demandée", ar: "تم طلب المساعدة" };
phrases["Goal updated"] = { fr: "Objectif mis à jour", ar: "تم تحديث الهدف" };
phrases["Intervention"] = { fr: "Accompagnement", ar: "تدخل" };
phrases["Alert"] = { fr: "Alerte", ar: "تنبيه" };
phrases["Academic score"] = { fr: "Score scolaire", ar: "النتيجة الأكاديمية" };

// Phase 3d — admin pages (Reports / Configuration)
phrases["Logged with actor and time"] = { fr: "Journalisée avec auteur et heure", ar: "مسجلة مع الفاعل والوقت" };
phrases["Report templates"] = { fr: "Modèles de rapports", ar: "قوالب التقارير" };
phrases["Class weekly reports"] = { fr: "Rapports hebdomadaires de classe", ar: "تقارير الفصول الأسبوعية" };
phrases["Search class"] = { fr: "Rechercher une classe", ar: "البحث عن فصل" };
phrases["No classes match your search"] = { fr: "Aucune classe ne correspond à votre recherche", ar: "لا توجد فصول تطابق بحثك" };
phrases["Recent exports"] = { fr: "Exportations récentes", ar: "عمليات التصدير الأخيرة" };
phrases["Report exported"] = { fr: "Rapport exporté", ar: "تم تصدير التقرير" };
phrases["Audited"] = { fr: "Journalisé", ar: "مُسجَّل" };
phrases["No exports recorded yet"] = { fr: "Aucune exportation enregistrée pour le moment", ar: "لا توجد عمليات تصدير مسجلة بعد" };
phrases["Configuration is available from a school context only."] = { fr: "La configuration n'est disponible que depuis un contexte d'établissement.", ar: "الإعدادات متاحة فقط من سياق مؤسسة تعليمية." };
phrases["Saving…"] = { fr: "Enregistrement…", ar: "جارٍ الحفظ…" };
phrases["Could not save settings. Please try again."] = { fr: "Impossible d'enregistrer les paramètres. Veuillez réessayer.", ar: "تعذر حفظ الإعدادات. يرجى المحاولة مرة أخرى." };
phrases["Privacy and persistence"] = { fr: "Confidentialité et persistance", ar: "الخصوصية والمثابرة" };
phrases["Changes are saved to this school's configuration and every change is recorded in the audit log."] = { fr: "Les modifications sont enregistrées dans la configuration de cet établissement et chaque changement est consigné dans le journal d'audit.", ar: "تُحفظ التغييرات في إعدادات هذه المؤسسة ويُسجَّل كل تغيير في سجل التدقيق." };
phrases["Current academic year"] = { fr: "Année scolaire en cours", ar: "السنة الدراسية الحالية" };
phrases["Active students"] = { fr: "Élèves actifs", ar: "الطلاب النشطون" };
phrases["Active types"] = { fr: "Types actifs", ar: "الأنواع النشطة" };
phrases["Active dimensions"] = { fr: "Dimensions actives", ar: "الأبعاد النشطة" };

// ---------------------------------------------------------------------------
// Batch 5 — translation coverage (90 keys audited)
// ---------------------------------------------------------------------------
phrases["A chronological view of check-ins, attendance, feedback, homework and family input."] = { fr: "Une vue chronologique des bilans, de la présence, des retours, des devoirs et des apports de la famille.", ar: "عرض زمني للتسجيلات والحضور والملاحظات والواجبات ومدخلات الأسرة." };
phrases["A short goal-setting conversation may help"] = { fr: "Une courte conversation sur les objectifs peut aider", ar: "محادثة قصيرة لتحديد الأهداف قد تساعد" };
phrases["Academic average"] = { fr: "Moyenne académique", ar: "المعدل الأكاديمي" };
phrases["Academic progress"] = { fr: "Progrès académiques", ar: "التقدم الأكاديمي" };
phrases["Across active classes"] = { fr: "Sur l’ensemble des classes actives", ar: "عبر جميع الفصول النشطة" };
phrases["Across all teachers"] = { fr: "Sur l’ensemble des enseignants", ar: "عبر جميع المعلمين" };
phrases["Across the roster"] = { fr: "Sur l’ensemble des effectifs", ar: "عبر جميع الطلاب" };
phrases["active teaching staff"] = { fr: "enseignants actifs", ar: "طاقم تدريس نشط" };
phrases["Activity over the last seven days"] = { fr: "Activité sur les sept derniers jours", ar: "النشاط خلال آخر سبعة أيام" };
phrases["Attendance patterns"] = { fr: "Tendances de présence", ar: "أنماط الحضور" };
phrases["Attendance records today"] = { fr: "Registres de présence du jour", ar: "سجلات الحضور اليوم" };
phrases["Average percentage per subject"] = { fr: "Pourcentage moyen par matière", ar: "متوسط النسبة لكل مادة" };
phrases["Based on self-reported check-ins"] = { fr: "Basé sur les bilans auto-déclarés", ar: "بناءً على التسجيلات الذاتية" };
phrases["Born"] = { fr: "Né(e)", ar: "المواليد" };
phrases["Both encouraging and corrective entries, in a constructive tone."] = { fr: "Des retours à la fois encourageants et correctifs, sur un ton constructif.", ar: "ملاحظات تشجيعية وتصحيحية بنبرة بناءة." };
phrases["Civil status and daily logistics."] = { fr: "État civil et logistique du quotidien.", ar: "الحالة المدنية والتنظيم اليومي." };
phrases["class"] = { fr: "classe", ar: "الفصل" };
phrases["Class assignments"] = { fr: "Affectations de classe", ar: "التوزيعات الدراسية" };
phrases["Competency framework"] = { fr: "Référentiel de compétences", ar: "إطار الكفايات" };
phrases["Consistent academic understanding"] = { fr: "Compréhension académique constante", ar: "فهم أكاديمي مستقر" };
phrases["Current goals"] = { fr: "Objectifs en cours", ar: "الأهداف الحالية" };
phrases["Current mastery levels"] = { fr: "Niveaux de maîtrise actuels", ar: "مستويات الإتقان الحالية" };
phrases["General"] = { fr: "Général", ar: "عام" };
phrases["Homeroom"] = { fr: "Classe principale", ar: "قسم الفصل" };
phrases["Human-led intervention and measured progress"] = { fr: "Intervention humaine et progrès mesurés", ar: "تدخل بشري وتقدم مقياس" };
phrases["Independent dimensions, not a single student score"] = { fr: "Dimensions indépendantes, pas un score unique", ar: "أبعاد مستقلة، وليست درجة واحدة" };
phrases["late"] = { fr: "en retard", ar: "متأخر" };
phrases["Longitudinal timeline"] = { fr: "Chronologie longitudinale", ar: "خط زمني طولي" };
phrases["Meetings with the family and the class team."] = { fr: "Rencontres avec la famille et l’équipe de la classe.", ar: "لقاءات مع الأسرة وفريق الفصل." };
phrases["Messages and observations shared by the family"] = { fr: "Messages et observations partagés par la famille", ar: "رسائل وملاحظات شاركتها الأسرة" };
phrases["Mood over recent days"] = { fr: "Humeur des derniers jours", ar: "المزاج خلال الأيام الأخيرة" };
phrases["Most recent submissions"] = { fr: "Rendus les plus récents", ar: "أحدث التسليمات" };
phrases["Motivation is lower than academic progress"] = { fr: "La motivation est inférieure aux progrès académiques", ar: "الدافع أقل من التقدم الأكاديمي" };
phrases["Need attention"] = { fr: "Besoin d’attention", ar: "يحتاج إلى انتباه" };
phrases["No achievements yet"] = { fr: "Aucun accomplissement pour l’instant", ar: "لا توجد إنجازات بعد" };
phrases["No check-ins recorded yet"] = { fr: "Aucun bilan enregistré pour l’instant", ar: "لا توجد تسجيلات بعد" };
phrases["No classes"] = { fr: "Aucune classe", ar: "لا توجد فصول" };
phrases["No competencies assessed yet"] = { fr: "Aucune compétence évaluée pour l’instant", ar: "لا توجد كفايات مقيّمة بعد" };
phrases["No consents recorded yet"] = { fr: "Aucun accord enregistré pour l’instant", ar: "لا توجد موافقات مسجلة بعد" };
phrases["No diagnosis is inferred from these trends"] = { fr: "Aucun diagnostic n’est déduit de ces tendances", ar: "لا يُستنتج أي تشخيص من هذه الاتجاهات" };
phrases["No documents recorded yet"] = { fr: "Aucun document enregistré pour l’instant", ar: "لا توجد مستندات مسجلة بعد" };
phrases["No events recorded yet"] = { fr: "Aucun événement enregistré pour l’instant", ar: "لا توجد أحداث مسجلة بعد" };
phrases["No goals yet"] = { fr: "Aucun objectif pour l’instant", ar: "لا توجد أهداف بعد" };
phrases["No grades recorded yet"] = { fr: "Aucune note enregistrée pour l’instant", ar: "لا توجد درجات مسجلة بعد" };
phrases["No guardians linked yet"] = { fr: "Aucun responsable lié pour l’instant", ar: "لا يوجد أولياء أمر مرتبطون بعد" };
phrases["No homeroom teacher"] = { fr: "Aucun professeur principal", ar: "لا يوجد معلم قسم" };
phrases["No homework submissions yet"] = { fr: "Aucun devoir rendu pour l’instant", ar: "لا توجد واجبات مسلّمة بعد" };
phrases["No meetings yet"] = { fr: "Aucune rencontre pour l’instant", ar: "لا توجد لقاءات بعد" };
phrases["No parent input recorded yet"] = { fr: "Aucun apport de la famille enregistré pour l’instant", ar: "لا توجد مدخلات من الأسرة مسجلة بعد" };
phrases["No phone"] = { fr: "Pas de téléphone", ar: "لا يوجد هاتف" };
phrases["No pickup persons yet"] = { fr: "Aucune personne autorisée pour l’instant", ar: "لا توجد أشخاص مخولون بالاستلام بعد" };
phrases["No students match your search"] = { fr: "Aucun élève ne correspond à votre recherche", ar: "لا يوجد طلاب يطابقون بحثك" };
phrases["No support plan yet"] = { fr: "Aucun plan d’accompagnement pour l’instant", ar: "لا توجد خطة دعم بعد" };
phrases["No teacher feedback yet"] = { fr: "Aucun retour d’enseignant pour l’instant", ar: "لا توجد ملاحظات من المعلم بعد" };
phrases["No teachers match your search"] = { fr: "Aucun enseignant ne correspond à votre recherche", ar: "لا يوجد معلمون يطابقون بحثك" };
phrases["Observed average"] = { fr: "Moyenne observée", ar: "المتوسط الملاحظ" };
phrases["Only available to authorised school staff."] = { fr: "Disponible uniquement au personnel autorisé de l’école.", ar: "متاح فقط لطاقم المدرسة المصرح لهم." };
phrases["Open a student to see the evidence"] = { fr: "Ouvrez un élève pour voir les éléments", ar: "افتح ملف طالب لعرض الأدلة" };
phrases["open alerts"] = { fr: "alertes ouvertes", ar: "تنبيهات مفتوحة" };
phrases["Outcome"] = { fr: "Résultat", ar: "النتيجة" };
phrases["PAI, PAP, PPS and AESH arrangements."] = { fr: "Dispositifs PAI, PAP, PPS et AESH.", ar: "ترتيبات PAI وPAP وPPS وAESH." };
phrases["People allowed to pick the student up at school."] = { fr: "Personnes autorisées à récupérer l’élève à l’école.", ar: "الأشخاص المسموح لهم باستلام الطالب من المدرسة." };
phrases["Perceived stress"] = { fr: "Stress perçu", ar: "الإجهاد المدرك" };
phrases["Positive recent homework trend"] = { fr: "Tendance récente positive des devoirs", ar: "اتجاه إيجابي حديث في الواجبات" };
phrases["Presence rate"] = { fr: "Taux de présence", ar: "معدل الحضور" };
phrases["Recent observations by the class team"] = { fr: "Observations récentes de l’équipe de la classe", ar: "ملاحظات حديثة من فريق الفصل" };
phrases["Recognitions and milestones"] = { fr: "Reconnaissances et jalons", ar: "التقديرات والمحطات" };
phrases["Reports, certificates and administrative files"] = { fr: "Rapports, certificats et dossiers administratifs", ar: "التقارير والشهادات والملفات الإدارية" };
phrases["Requests are visible only to authorised staff"] = { fr: "Les demandes ne sont visibles que par le personnel autorisé", ar: "الطلبات مرئية فقط للطاقم المصرح لهم" };
phrases["Responsible"] = { fr: "Responsable", ar: "المسؤول" };
phrases["Roster size"] = { fr: "Taille des effectifs", ar: "حجم الفوج" };
phrases["School pulse"] = { fr: "Dynamique de l’école", ar: "مؤشر المدرسة" };
phrases["Signed agreements and pick-up authorisations."] = { fr: "Accords signés et autorisations de sortie.", ar: "الاتفاقيات الموقعة وتفويضات الاستلام." };
phrases["Staff directory, class assignments and teaching load."] = { fr: "Annuaire du personnel, affectations de classe et charge d’enseignement.", ar: "دليل الطاقم وتوزيعات الفصول وعبء التدريس." };
phrases["Strengths"] = { fr: "Points forts", ar: "نقاط القوة" };
phrases["Student and teacher owned actions"] = { fr: "Actions portées par l’élève et l’enseignant", ar: "إجراءات يملكها الطالب والمعلم" };
phrases["Student form"] = { fr: "Formulaire élève", ar: "استمارة الطالب" };
phrases["Student-reported wellbeing"] = { fr: "Bien-être rapporté par l’élève", ar: "رفاهية يُعلنها الطالب" };
phrases["STUDENT360"] = { fr: "STUDENT360", ar: "STUDENT360" };
phrases["Students flagged for follow-up"] = { fr: "Élèves signalés pour suivi", ar: "طلاب مؤشر عليهم للمتابعة" };
phrases["Subject breakdown"] = { fr: "Répartition par matière", ar: "التوزيع حسب المادة" };
phrases["Support opportunity"] = { fr: "Opportunité de soutien", ar: "فرصة دعم" };
phrases["Supportive framing"] = { fr: "Cadre bienveillant", ar: "تأطير داعم" };
phrases["Trends are descriptive, not medical or psychological diagnoses."] = { fr: "Les tendances sont descriptives, pas des diagnostics médicaux ou psychologiques.", ar: "الاتجاهات وصفية وليست تشخيصات طبية أو نفسية." };
phrases["Unknown"] = { fr: "Inconnu", ar: "غير معروف" };
phrases["unread"] = { fr: "non lues", ar: "غير مقروءة" };
phrases["You are all caught up."] = { fr: "Vous êtes à jour.", ar: "لقد استعرضت كل شيء." };
// ---------------------------------------------------------------------------
// Actions & administration (socle admin)
// ---------------------------------------------------------------------------
phrases["My actions"] = { fr: "Mes actions", ar: "أنشطتي" };
phrases["Actions"] = { fr: "Actions", ar: "الأنشطة" };
phrases["Templates"] = { fr: "Modèles", ar: "القوالب" };
phrases["Recurring tasks that keep the school community connected — complete the ones that are due for you."] = { fr: "Des tâches récurrentes qui font vivre la communauté scolaire — réalisez celles qui vous sont dues.", ar: "مهام متكررة تُبقي المجتمع المدرسي متواصلاً — أنجز ما هو مستحق عليك." };
phrases["To do"] = { fr: "À faire", ar: "للقيام" };
phrases["Actions pending"] = { fr: "Actions en attente", ar: "أنشطة معلقة" };
phrases["Mandatory open"] = { fr: "Obligatoires ouvertes", ar: "واجبات مفتوحة" };
phrases["Required this period"] = { fr: "Exigées cette période", ar: "مطلوبة هذه الفترة" };
phrases["Done recently"] = { fr: "Réalisées récemment", ar: "أُنجزت مؤخراً" };
phrases["Mark them done once completed — the app tracks them automatically."] = { fr: "Marquez-les comme faites une fois réalisées — l'application les suit automatiquement.", ar: "علّمها كمكتملة بعد الإنجاز — يتابعها التطبيق تلقائياً." };
phrases["Nothing due right now — come back later."] = { fr: "Rien à faire pour le moment — revenez plus tard.", ar: "لا شيء مستحق الآن — عد لاحقاً." };
phrases["Mandatory"] = { fr: "Obligatoire", ar: "إلزامي" };
phrases["Optional"] = { fr: "Facultatif", ar: "اختياري" };
phrases["Suggested by the app"] = { fr: "Proposée par l'application", ar: "اقترحها التطبيق" };
phrases["Set by administration"] = { fr: "Définie par l'administration", ar: "حددتها الإدارة" };
phrases["Set by a teacher"] = { fr: "Définie par un enseignant", ar: "حددها معلم" };
phrases["For"] = { fr: "Pour", ar: "لـ" };
phrases["Due"] = { fr: "Échéance", ar: "موعد الاستحقاق" };
phrases["Skip"] = { fr: "Passer", ar: "تخطي" };
phrases["Add a short note (optional)"] = { fr: "Ajouter une courte note (facultatif)", ar: "أضف ملاحظة قصيرة (اختياري)" };
phrases["Action history"] = { fr: "Historique des actions", ar: "سجل الأنشطة" };
phrases["Skipped"] = { fr: "Passée", ar: "تم تخطيها" };
phrases["Recurring mandatory and optional actions for teachers, students and parents — assigned by you or suggested by the app."] = { fr: "Actions récurrentes obligatoires et facultatives pour les enseignants, élèves et parents — assignées par vous ou proposées par l'application.", ar: "أنشطة متكررة إلزامية واختيارية للمعلمين والطلاب وأولياء الأمور — عيّنها أنت أو اقترحها التطبيق." };
phrases["Active and inactive"] = { fr: "Actifs et inactifs", ar: "نشطة وغير نشطة" };
phrases["Targeting teachers"] = { fr: "Destinées aux enseignants", ar: "موجهة للمعلمين" };
phrases["Students & parents"] = { fr: "Élèves & parents", ar: "الطلاب وأولياء الأمور" };
phrases["Targeting families"] = { fr: "Destinées aux familles", ar: "موجهة للأسر" };
phrases["New recurring action"] = { fr: "Nouvelle action récurrente", ar: "نشاط متكرر جديد" };
phrases["The app will assign it automatically to every eligible person, once per period."] = { fr: "L'application l'assignera automatiquement à chaque personne éligible, une fois par période.", ar: "سيخصصه التطبيق تلقائياً لكل شخص مؤهل، مرة واحدة في كل فترة." };
phrases["What should be done?"] = { fr: "Que faut-il faire ?", ar: "ما المطلوب إنجازه؟" };
phrases["Optional details"] = { fr: "Détails facultatifs", ar: "تفاصيل اختيارية" };
phrases["Frequency"] = { fr: "Fréquence", ar: "التكرار" };
phrases["Every day"] = { fr: "Chaque jour", ar: "كل يوم" };
phrases["Every week"] = { fr: "Chaque semaine", ar: "كل أسبوع" };
phrases["Every month"] = { fr: "Chaque mois", ar: "كل شهر" };
phrases["Once"] = { fr: "Une seule fois", ar: "مرة واحدة" };
phrases["Scope"] = { fr: "Portée", ar: "النطاق" };
phrases["Whole school"] = { fr: "Toute l'école", ar: "المدرسة بأكملها" };
phrases["Create action"] = { fr: "Créer l'action", ar: "إنشاء النشاط" };
phrases["Failed — code not unique or invalid."] = { fr: "Échec — code non unique ou invalide.", ar: "فشل — الرمز مستخدم مسبقاً أو غير صالح." };
phrases["Assign a one-off action"] = { fr: "Assigner une action ponctuelle", ar: "تعيين نشاط لمرة واحدة" };
phrases["Send a specific task to one person immediately."] = { fr: "Envoyez une tâche précise à une personne immédiatement.", ar: "أرسل مهمة محددة إلى شخص واحد فوراً." };
phrases["To"] = { fr: "À", ar: "إلى" };
phrases["Person"] = { fr: "Personne", ar: "الشخص" };
phrases["Select…"] = { fr: "Sélectionner…", ar: "اختر…" };
phrases["Due date"] = { fr: "Date d'échéance", ar: "تاريخ الاستحقاق" };
phrases["Could not assign — check the recipient."] = { fr: "Impossible d'assigner — vérifiez le destinataire.", ar: "تعذر التعيين — تحقق من المستلم." };
phrases["Template created"] = { fr: "Modèle créé", ar: "تم إنشاء النموذج" };
phrases["Action assigned"] = { fr: "Action assignée", ar: "تم تعيين النشاط" };
phrases["Recurring actions"] = { fr: "Actions récurrentes", ar: "الأنشطة المتكررة" };
phrases["Generated automatically each period for every eligible person."] = { fr: "Générées automatiquement à chaque période pour chaque personne éligible.", ar: "تُنشأ تلقائياً كل فترة لكل شخص مؤهل." };
phrases["Action"] = { fr: "Action", ar: "النشاط" };
phrases["Coverage"] = { fr: "Couverture", ar: "التغطية" };
phrases["assigned"] = { fr: "assignées", ar: "تم تعيينها" };
phrases["Pause"] = { fr: "Mettre en pause", ar: "إيقاف مؤقت" };
phrases["Activate"] = { fr: "Activer", ar: "تفعيل" };
phrases["No recurring actions yet — create your first one above."] = { fr: "Aucune action récurrente pour l'instant — créez la première ci-dessus.", ar: "لا توجد أنشطة متكررة بعد — أنشئ أول واحد أعلاه." };
phrases["Temporary passwords — share them once. Each person will change theirs at first login."] = { fr: "Mots de passe temporaires — à partager une seule fois. Chacun changera le sien à la première connexion.", ar: "كلمات مرور مؤقتة — شاركها مرة واحدة. سيغيّر كل شخص كلمة المرور عند أول تسجيل دخول." };
phrases["Accounts created"] = { fr: "Comptes créés", ar: "تم إنشاء الحسابات" };
phrases["Account created"] = { fr: "Compte créé", ar: "تم إنشاء الحساب" };
phrases["Add a student"] = { fr: "Ajouter un élève", ar: "إضافة طالب" };
phrases["Creates the student account and optionally their parents."] = { fr: "Crée le compte de l'élève et éventuellement ceux de ses parents.", ar: "ينشئ حساب الطالب وعند الحاجة حسابات والديه." };
phrases["Class"] = { fr: "Classe", ar: "الفصل" };
phrases["No class yet"] = { fr: "Pas encore de classe", ar: "لا فصل بعد" };
phrases["Date of birth"] = { fr: "Date de naissance", ar: "تاريخ الميلاد" };
phrases["Parents / guardians"] = { fr: "Parents / tuteurs", ar: "أولياء الأمور / الأوصياء" };
phrases["Add guardian"] = { fr: "Ajouter un tuteur", ar: "إضافة ولي أمر" };
phrases["Create student"] = { fr: "Créer l'élève", ar: "إنشاء الطالب" };
phrases["Email already used"] = { fr: "E-mail déjà utilisé", ar: "البريد الإلكتروني مستخدم بالفعل" };
phrases["Could not create the student"] = { fr: "Impossible de créer l'élève", ar: "تعذر إنشاء الطالب" };
phrases["Add a parent"] = { fr: "Ajouter un parent", ar: "إضافة ولي أمر" };
phrases["Create the parent account and link them to children."] = { fr: "Crée le compte du parent et le lie à des enfants.", ar: "ينشئ حساب ولي الأمر ويربطه بالأبناء." };
phrases["Link to children"] = { fr: "Lier aux enfants", ar: "الربط بالأبناء" };
phrases["No students yet"] = { fr: "Pas encore d'élèves", ar: "لا طلاب بعد" };
phrases["Create parent"] = { fr: "Créer le parent", ar: "إنشاء ولي الأمر" };
phrases["Could not create the parent"] = { fr: "Impossible de créer le parent", ar: "تعذر إنشاء ولي الأمر" };
phrases["Add a teacher"] = { fr: "Ajouter un enseignant", ar: "إضافة معلم" };
phrases["Creates the account and assigns the chosen classes."] = { fr: "Crée le compte et affecte les classes choisies.", ar: "ينشئ الحساب ويعيّن الفصول المختارة." };
phrases["Assign to classes"] = { fr: "Affecter aux classes", ar: "التعيين إلى الفصول" };
phrases["Create teacher"] = { fr: "Créer l'enseignant", ar: "إنشاء المعلم" };
phrases["Could not create the teacher"] = { fr: "Impossible de créer l'enseignant", ar: "تعذر إنشاء المعلم" };
phrases["Assign an existing teacher"] = { fr: "Affecter un enseignant existant", ar: "تعيين معلم موجود" };
phrases["Teacher"] = { fr: "Enseignant", ar: "المعلم" };
phrases["Subject"] = { fr: "Matière", ar: "المادة" };
phrases["Any"] = { fr: "Toute", ar: "أي" };
phrases["Subject teacher"] = { fr: "Professeur de matière", ar: "معلم مادة" };
phrases["Homeroom teacher"] = { fr: "Professeur principal", ar: "معلم الصف" };
phrases["Already assigned"] = { fr: "Déjà affecté", ar: "تم تعيينه بالفعل" };
phrases["Could not assign"] = { fr: "Impossible d'affecter", ar: "تعذر التعيين" };
phrases["Create a class"] = { fr: "Créer une classe", ar: "إنشاء فصل" };
phrases["Adds a class to the current school year."] = { fr: "Ajoute une classe à l'année scolaire en cours.", ar: "يضيف فصلاً إلى السنة الدراسية الحالية." };
phrases["Class name"] = { fr: "Nom de la classe", ar: "اسم الفصل" };
phrases["Grade level"] = { fr: "Niveau", ar: "المستوى الدراسي" };
phrases["Section"] = { fr: "Section", ar: "القسم" };
phrases["Capacity"] = { fr: "Capacité", ar: "السعة" };
phrases["None"] = { fr: "Aucun", ar: "لا شيء" };
phrases["Create class"] = { fr: "Créer la classe", ar: "إنشاء الفصل" };
phrases["A class with this name already exists this year"] = { fr: "Une classe portant ce nom existe déjà cette année", ar: "يوجد فصل بنفس الاسم هذا العام" };
phrases["Could not create the class"] = { fr: "Impossible de créer la classe", ar: "تعذر إنشاء الفصل" };
phrases["Current assignments"] = { fr: "Affectations actuelles", ar: "التعيينات الحالية" };
phrases["Remove"] = { fr: "Retirer", ar: "إزالة" };
phrases["Weekly timetable"] = { fr: "Emploi du temps hebdomadaire", ar: "الجدول الأسبوعي" };
phrases["Manage the class weekly schedule."] = { fr: "Gérez le planning hebdomadaire de la classe.", ar: "أدر الجدول الأسبوعي للفصل." };
phrases["Day"] = { fr: "Jour", ar: "اليوم" };
phrases["Start"] = { fr: "Début", ar: "البداية" };
phrases["End"] = { fr: "Fin", ar: "النهاية" };
phrases["Add slot"] = { fr: "Ajouter un créneau", ar: "إضافة حصة" };
phrases["No slots"] = { fr: "Aucun créneau", ar: "لا حصص" };
phrases["Could not add the slot"] = { fr: "Impossible d'ajouter le créneau", ar: "تعذر إضافة الحصة" };
phrases["Monday"] = { fr: "Lundi", ar: "الاثنين" };
phrases["Tuesday"] = { fr: "Mardi", ar: "الثلاثاء" };
phrases["Wednesday"] = { fr: "Mercredi", ar: "الأربعاء" };
phrases["Thursday"] = { fr: "Jeudi", ar: "الخميس" };
phrases["Friday"] = { fr: "Vendredi", ar: "الجمعة" };
phrases["Saturday"] = { fr: "Samedi", ar: "السبت" };
phrases["Sunday"] = { fr: "Dimanche", ar: "الأحد" };
phrases["Type"] = { fr: "Type", ar: "النوع" };
phrases["Parents"] = { fr: "Parents", ar: "أولياء الأمور" };
phrases["Delete"] = { fr: "Supprimer", ar: "حذف" };
phrases["Mark daily attendance"] = { fr: "Marquer l'assiduité du jour", ar: "تسجيل حضور اليوم" };
phrases["Record who is present in each class every day."] = { fr: "Enregistrez chaque jour qui est présent dans chaque classe.", ar: "سجل كل يوم من حضر في كل فصل." };
phrases["Share your weekly check-in"] = { fr: "Partager votre bilan hebdomadaire", ar: "شارك تقييمك الأسبوعي" };
phrases["A quick mood and energy check keeps the class connected."] = { fr: "Un bref bilan d'humeur et d'énergie maintient la classe connectée.", ar: "تقييم سريع للمزاج والطاقة يحافظ على تواصل الفصل." };
phrases["Finish your homework for this week"] = { fr: "Terminer vos devoirs de la semaine", ar: "أنهِ واجباتك لهذا الأسبوع" };
phrases["Hand in the assignments that are due this week."] = { fr: "Rendez les devoirs attendus cette semaine.", ar: "سلّم الواجبات المستحقة هذا الأسبوع." };
phrases["Share a weekly update with the school"] = { fr: "Partager une mise à jour hebdomadaire avec l'école", ar: "شارك تحديثاً أسبوعياً مع المدرسة" };
phrases["Homework support, observations or a short note for the teacher."] = { fr: "Aide aux devoirs, observations ou courte note pour l'enseignant.", ar: "مساعدة في الواجبات أو ملاحظات أو ملاحظة قصيرة للمعلم." };
phrases["Send the monthly family report"] = { fr: "Envoyer le rapport mensuel aux familles", ar: "أرسل التقرير الشهري إلى الأسر" };
phrases["A concise progress summary for the families of your class."] = { fr: "Un résumé de progression concis pour les familles de votre classe.", ar: "ملخص موجز للتقدم لأسر فصلتك." };

// ---------------------------------------------------------------------------
// Modules & permissions (Skouly-aligned, per-profile access)
// ---------------------------------------------------------------------------
phrases["Establishments"] = { fr: "Établissements", ar: "المؤسسات" };
phrases["Student Performance"] = { fr: "Performance Élève", ar: "أداء التلميذ" };
phrases["Calendar"] = { fr: "Calendrier", ar: "التقويم" };
phrases["Messaging"] = { fr: "Messagerie", ar: "المراسلة" };
phrases["Programs"] = { fr: "Programmes", ar: "البرامج" };
phrases["Levels & Subjects"] = { fr: "Niveaux & Matières", ar: "المستويات والمواد" };
phrases["Internal Rules"] = { fr: "Règlement intérieur", ar: "النظام الداخلي" };
phrases["Canteen"] = { fr: "Cantine", ar: "المقصف" };
phrases["Finance & Fees"] = { fr: "Finance & Frais", ar: "المالية والرسوم" };
phrases["Modules & Permissions"] = { fr: "Modules & Permissions", ar: "الوحدات والصلاحيات" };
phrases["People & Administration"] = { fr: "Personnes & Administration", ar: "الأشخاص والإدارة" };
phrases["Academic & Curriculum"] = { fr: "Académique & Programme", ar: "الأكاديمي والمناهج" };
phrases["Operations & Campus"] = { fr: "Opérations & Campus", ar: "العمليات والحرم المدرسي" };
phrases["Communication & Community"] = { fr: "Communication & Communauté", ar: "التواصل والمجتمع" };
phrases["Finance & Reporting"] = { fr: "Finance & Reporting", ar: "المالية والتقارير" };
phrases["Connect"] = { fr: "Connecter", ar: "تواصل" };
phrases["Module"] = { fr: "Module", ar: "الوحدة" };
phrases["Read"] = { fr: "Lecture", ar: "قراءة" };
phrases["Write"] = { fr: "Écriture", ar: "كتابة" };
phrases["No access"] = { fr: "Aucun accès", ar: "لا يوجد وصول" };
phrases["Create, edit and manage"] = { fr: "Créer, modifier et gérer", ar: "إنشاء وتعديل وإدارة" };
phrases["View and consult"] = { fr: "Consulter et voir", ar: "عرض واطلاع" };
phrases["Every profile accesses the platform through modules, each granted read or write access. This matrix is read-only and defines what each profile can see and do."] = { fr: "Chaque profil accède à la plateforme via des modules, chacun disposant d'un accès en lecture ou en écriture. Cette matrice est en lecture seule et définit ce que chaque profil peut voir et faire.", ar: "يصل كل ملف شخصي إلى المنصة عبر وحدات، تُمنح لكل منها صلاحية قراءة أو كتابة. هذه المصفوفة للقراءة فقط وتحدد ما يمكن لكل ملف رؤيته والقيام به." };
phrases["This module is on the roadmap and will be available in a future update."] = { fr: "Ce module fait partie de la feuille de route et sera disponible dans une prochaine mise à jour.", ar: "هذه الوحدة ضمن خارطة الطريق وستكون متاحة في تحديث قادم." };

// ---------------------------------------------------------------------------
// Accounts & establishments (admin)
// ---------------------------------------------------------------------------
phrases["Seats limit"] = { fr: "Limite de sièges", ar: "حد المقاعد" };
phrases["Profile"] = { fr: "Profil", ar: "الملف الشخصي" };
phrases["Pro"] = { fr: "Pro", ar: "احترافي" };
phrases["Enterprise"] = { fr: "Entreprise", ar: "مؤسسات" };
phrases["Morocco"] = { fr: "Maroc", ar: "المغرب" };
phrases["France"] = { fr: "France", ar: "فرنسا" };
phrases["Spain"] = { fr: "Espagne", ar: "إسبانيا" };
phrases["Belgium"] = { fr: "Belgique", ar: "بلجيكا" };
phrases["Canada"] = { fr: "Canada", ar: "كندا" };
phrases["Senegal"] = { fr: "Sénégal", ar: "السنغال" };
phrases["United States"] = { fr: "États-Unis", ar: "الولايات المتحدة" };
phrases["Create an account"] = { fr: "Créer un compte", ar: "إنشاء حساب" };
phrases["Create account"] = { fr: "Créer le compte", ar: "إنشاء الحساب" };
phrases["Create an establishment"] = { fr: "Créer un établissement", ar: "إنشاء مؤسسة" };
phrases["Create establishment"] = { fr: "Créer l'établissement", ar: "إنشاء المؤسسة" };
phrases["Establishment created"] = { fr: "Établissement créé", ar: "تم إنشاء المؤسسة" };
phrases["No classes yet"] = { fr: "Aucune classe pour le moment", ar: "لا توجد فصول بعد" };
phrases["Could not create the account"] = { fr: "Impossible de créer le compte", ar: "تعذر إنشاء الحساب" };
phrases["Could not create the establishment"] = { fr: "Impossible de créer l'établissement", ar: "تعذر إنشاء المؤسسة" };
phrases["Creates a staff or parent account with a temporary password."] = { fr: "Crée un compte personnel ou parent avec un mot de passe temporaire.", ar: "إنشاء حساب موظف أو ولي أمر بكلمة مرور مؤقتة." };
phrases["Adds a new school to the platform with its own campus and school year."] = { fr: "Ajoute un nouvel établissement à la plateforme avec son campus et son année scolaire.", ar: "إضافة مدرسة جديدة إلى المنصة مع حرمها وسنتها الدراسية." };

// ---------------------------------------------------------------------------
// School group manager & establishment switcher
// ---------------------------------------------------------------------------
phrases["School group manager"] = { fr: "Gestionnaire d'établissements", ar: "مدير المؤسسات" };
phrases["My establishments"] = { fr: "Mes établissements", ar: "مؤسساتي" };
phrases["Create an administration account"] = { fr: "Créer un compte administration", ar: "إنشاء حساب إداري" };
phrases["No establishment yet — create your first school above."] = { fr: "Aucun établissement pour l'instant — créez votre première école ci-dessus.", ar: "لا توجد مؤسسة بعد — أنشئ مدرستك الأولى أعلاه." };
phrases["Manage the schools in your group: create establishments and delegate administration accounts."] = { fr: "Gérez les écoles de votre groupe : créez des établissements et déléguez des comptes administration.", ar: "أدر مدارس مجموعتك: أنشئ مؤسسات وفوّض حسابات إدارية." };
phrases["Could not switch establishment"] = { fr: "Impossible de changer d'établissement", ar: "تعذر تغيير المؤسسة" };
phrases["Creates an account that will manage the chosen establishment."] = { fr: "Crée un compte qui gérera l'établissement choisi.", ar: "إنشاء حساب سيدير المؤسسة المختارة." };
phrases["Edit"] = { fr: "Modifier", ar: "تعديل" };
phrases["Save"] = { fr: "Enregistrer", ar: "حفظ" };
phrases["Confirm delete"] = { fr: "Confirmer la suppression", ar: "تأكيد الحذف" };
phrases["Name already used"] = { fr: "Nom déjà utilisé", ar: "الاسم مستخدم بالفعل" };
phrases["Could not update the establishment"] = { fr: "Impossible de modifier l'établissement", ar: "تعذر تعديل المؤسسة" };
phrases["Could not delete the establishment"] = { fr: "Impossible de supprimer l'établissement", ar: "تعذر حذف المؤسسة" };
