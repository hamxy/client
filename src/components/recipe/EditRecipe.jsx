import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Snackbar } from "@mui/joy";
import ProductSearch from "../Product/ProductSearch";
import { getRecipeById, updateRecipe } from "../../services/recipeService";
import DeleteIcon from "@mui/icons-material/Delete";

const EditRecipe = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("breakfast");
  const [steps, setSteps] = useState([""]);
  const [products, setProducts] = useState([]);
  const [preparationTime, setPreparationTime] = useState(0);
  const [cookingTime, setCookingTime] = useState(0);
  const [photoFile, setPhotoFile] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipe = await getRecipeById(id);
        setTitle(recipe.title);
        setDescription(recipe.description);
        setCourse(recipe.course);
        setSteps(recipe.steps);
        setProducts(
          recipe.products.map(({ product, quantity }) => ({
            product: product._id,
            name: product.name,
            quantity,
          }))
        );
        setPreparationTime(recipe.preparationTime);
        setCookingTime(recipe.cookingTime);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleCourseSelection = (e) => {
    setCourse(e.target.value);
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleStepChange = (e, index) => {
    const newSteps = [...steps];
    newSteps[index] = e.target.value;
    setSteps(newSteps);
  };

  const handleDeleteLastStep = () => {
    if (steps.length > 1) {
      const newSteps = steps.slice(0, -1);
      setSteps(newSteps);
    }
  };

  const handleAddProduct = (product) => {
    setProducts([
      ...products,
      { product: product._id, name: product.name, quantity: 100 },
    ]);
  };

  const handleDeleteProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleProductQuantityChange = (index, quantity) => {
    const newProducts = [...products];
    newProducts[index].quantity = quantity;
    setProducts(newProducts);
  };

  const handlePreparationTimeChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      setPreparationTime(value);
    }
  };

  const handleCookingTimeChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      setCookingTime(value);
    }
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSnackClose = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("course", course);
    formData.append("steps", JSON.stringify(steps));
    formData.append(
      "products",
      JSON.stringify(
        products.map(({ product, quantity }) => ({ product, quantity }))
      )
    );
    formData.append("preparationTime", preparationTime);
    formData.append("cookingTime", cookingTime);
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    // Debug: Log FormData entries
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await updateRecipe(id, formData);
      console.log("Recipe updated successfully:", response);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Recipe
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          autoComplete="off"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          autoComplete="off"
        />
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Upload Photo
        </Typography>
        <input type="file" onChange={handlePhotoChange} />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Course
        </Typography>
        <Select
          labelId="course"
          id="course"
          value={course}
          label="Course"
          onChange={handleCourseSelection}
          fullWidth
        >
          <MenuItem value={"breakfast"}>Breakfast</MenuItem>
          <MenuItem value={"lunch"}>Lunch</MenuItem>
          <MenuItem value={"dinner"}>Dinner</MenuItem>
          <MenuItem value={"snack"}>Snack</MenuItem>
        </Select>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Steps
        </Typography>
        {steps.map((step, index) => (
          <Box key={index} display="flex" alignItems="center">
            <TextField
              label={`Step ${index + 1}`}
              value={step}
              onChange={(e) => handleStepChange(e, index)}
              fullWidth
              autoComplete="off"
            />
          </Box>
        ))}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button onClick={handleAddStep} variant="contained" color="primary">
            Add Step
          </Button>
          {steps.length > 1 && (
            <Button
              onClick={handleDeleteLastStep}
              variant="contained"
              color="error"
            >
              Delete Last Step
            </Button>
          )}
        </Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Products
        </Typography>
        <ProductSearch onAddProduct={handleAddProduct} />

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity (grams or ml)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductQuantityChange(index, e.target.value)
                      }
                      sx={{ width: "100px" }}
                      autoComplete="off"
                      InputProps={{ inputProps: { min: 0 } }} // To ensure quantity is non-negative
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDeleteProduct(index)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TextField
          label="Preparation Time (minutes)"
          type="number"
          value={preparationTime}
          onChange={handlePreparationTimeChange}
          fullWidth
          autoComplete="off"
          sx={{ mt: 2 }}
          InputProps={{ inputProps: { min: 0 } }} // To ensure preparation time is non-negative
        />
        <TextField
          label="Cooking Time (minutes)"
          type="number"
          value={cookingTime}
          onChange={handleCookingTimeChange}
          fullWidth
          autoComplete="off"
          sx={{ mt: 2 }}
          InputProps={{ inputProps: { min: 0 } }} // To ensure preparation time is non-negative
        />
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Update Recipe
        </Button>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          color="success"
          onClose={handleSnackClose}
        >
          Recipe has been updated. Redirecting to all recipes.
        </Snackbar>
      </form>
    </Box>
  );
};

export default EditRecipe;
